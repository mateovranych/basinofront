import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import Swal from 'sweetalert2';
import { PedidoService } from '../../services/pedido-service';
import { Pedido } from '../../interfaces/Pedido';
import { PedidosDialog } from './pedidos-dialog/pedidos-dialog';
import { MatSelectModule } from '@angular/material/select';
import { EstadoService } from '../../services/estado-service';


@Component({
  selector: 'app-pedidos',
  standalone: true,
  templateUrl: './pedidos.html',
  styleUrl: './pedidos.scss',
  imports: [
    CommonModule,
    MatDialogModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatInputModule,
    MatSelectModule
  ]
})
export class Pedidos implements OnInit {
 displayedColumns: string[] = ['id', 'cliente', 'estado', 'fecha', 'total', 'acciones'];
  dataSource = new MatTableDataSource<Pedido>([]);
  estados: { id: number; nombre: string }[] = [];
  cargando = false;

  constructor(
    private service: PedidoService,
    private dialog: MatDialog,
    private estadoService: EstadoService
  ) {}

  ngOnInit(): void {
    this.cargarPedidos();
    this.cargarEstados();
    this.configurarFiltro();
  }

  cargarPedidos(): void {
    this.cargando = true;
    this.service.obtenerPedidos().subscribe({
      next: (res) => {
        this.dataSource.data = res;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        Swal.fire('Error', 'No se pudieron cargar los pedidos', 'error');
      }
    });
  }




   cargarEstados(): void {
    this.estadoService.obtenerTodos().subscribe({
      next: (res) => (this.estados = res),
      error: () => Swal.fire('Error', 'No se pudieron cargar los estados', 'error')
    });
  }

  aplicarFiltro(event: Event): void {
    const valor = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = valor;
  }

  configurarFiltro(): void {
    this.dataSource.filterPredicate = (data: Pedido, filtro: string): boolean => {
      const texto = filtro.toLowerCase();
      return (
        data.clienteNombre.toLowerCase().includes(texto) ||
        data.estadoNombre.toLowerCase().includes(texto) ||
        data.total.toString().includes(texto)
      );
    };
  }

  abrirDialogNuevo(): void {
    const dialogRef = this.dialog.open(PedidosDialog, {
      width: '900px',
      data: { modo: 'crear' }
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado === 'guardado') this.cargarPedidos();
    });
  }

  cambiarEstado(pedido: Pedido, nuevoEstadoId: number): void {
    if (pedido.estadoId === nuevoEstadoId) return;

    this.service.actualizarEstado(pedido.id, nuevoEstadoId).subscribe({
      next: () => {
        pedido.estadoId = nuevoEstadoId;
        pedido.estadoNombre = this.estados.find(e => e.id === nuevoEstadoId)?.nombre || '';
        Swal.fire('Actualizado', 'El estado del pedido fue actualizado', 'success');
      },
      error: () => Swal.fire('Error', 'No se pudo actualizar el estado', 'error')
    });
  }

  eliminarPedido(id: number): void {
    Swal.fire({
      title: '¿Eliminar pedido?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.eliminarPedido(id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Pedido eliminado correctamente', 'success');
            this.cargarPedidos();
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar el pedido', 'error')
        });
      }
    });
  }
}
