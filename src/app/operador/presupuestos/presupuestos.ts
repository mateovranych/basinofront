import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { PresupuestoService } from '../../services/presupuesto-service';
import { Presupuesto } from '../../interfaces/Presupuesto';
import { PresupuestosDialogComponent } from './presupuestos-dialog-component/presupuestos-dialog-component';
import Swal from 'sweetalert2';
import { MatInputModule } from "@angular/material/input";

@Component({
  selector: 'app-presupuestos',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatInputModule
],
  templateUrl: './presupuestos.html',
  styleUrl: './presupuestos.scss'
})
export class Presupuestos implements OnInit {
  displayedColumns: string[] = ['id', 'cliente', 'fecha', 'total', 'acciones'];
  dataSource = new MatTableDataSource<Presupuesto>([]);
  cargando = false;

  constructor(
    private service: PresupuestoService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.cargarPresupuestos();
    this.configurarFiltro();
  }

  cargarPresupuestos(): void {
    this.cargando = true;
    this.service.obtenerPresupuestos().subscribe({
      next: (res) => {
        this.dataSource.data = res;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        Swal.fire('Error', 'No se pudieron cargar los presupuestos', 'error');
      }
    });
  }

  aplicarFiltro(event: Event): void {
    const valor = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = valor;
  }

  configurarFiltro(): void {
    this.dataSource.filterPredicate = (data: Presupuesto, filtro: string): boolean => {
      const texto = filtro.toLowerCase();

      const id = data.id?.toString().toLowerCase() || '';
      const cliente = data.clienteNombre?.toLowerCase() || '';
      const fecha = new Date(data.fecha).toLocaleDateString('es-AR');
      const total = data.total?.toString().toLowerCase() || '';

      return (
        id.includes(texto) ||
        cliente.includes(texto) ||
        fecha.includes(texto) ||
        total.includes(texto)
      );
    };
  }

  abrirDialogNuevo(): void {
    const dialogRef = this.dialog.open(PresupuestosDialogComponent, {
      width: '900px',
      data: { modo: 'crear' }
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado === 'guardado') {
        this.cargarPresupuestos();
      }
    });
  }

  eliminarPresupuesto(id: number): void {
    Swal.fire({
      title: '¿Eliminar presupuesto?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.eliminarPresupuesto(id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Presupuesto eliminado correctamente', 'success');
            this.cargarPresupuestos();
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar el presupuesto', 'error')
        });
      }
    });
  }
}
