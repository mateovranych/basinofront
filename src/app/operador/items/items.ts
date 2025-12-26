import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import Swal from 'sweetalert2';
import { ItemsDialogComponent } from './items-dialog-component/items-dialog-component';
import { ItemsService } from '../../services/items-service';
import { SignalRService } from '../../services/signal-rservice';
import { Item } from '../../interfaces/Items/Item';

import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-items',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule
  ],
  templateUrl: './items.html',
  styleUrl: './items.scss'
})
export class Items implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['codigo', 'descripcion', 'esServicio', 'categoria', 'requiereFrio', 'habilitado', 'acciones'];
  dataSource = new MatTableDataSource<Item>([]);
  cargando = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private service: ItemsService,
    private dialog: MatDialog,
    private signal: SignalRService
  ) { }

  ngOnInit(): void {
    this.cargarItems();

    this.signal.listen("actualizar", (data) => {
      if (data === "items") {        
        this.cargarItems();
      }
    });

    this.configurarFiltro();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  cargarItems(): void {
    this.cargando = true;
    this.service.obtenerItems().subscribe({
      next: (res) => {
        this.dataSource.data = res;
        this.cargando = false;
      },
      error: () => {
        Swal.fire('Error', 'No se pudieron cargar los ítems', 'error');
        this.cargando = false;
      }
    });
  }

  configurarFiltro() {
    this.dataSource.filterPredicate = (data: Item, filtro: string): boolean => {
      const t = filtro.trim().toLowerCase();

      const codigo = data.codigo?.toLowerCase() || '';
      const descripcion = data.descripcion?.toLowerCase() || '';
      const categoria = data.categoriaNombre?.toLowerCase() || '';

      return (
        codigo.includes(t) ||
        descripcion.includes(t) ||
        categoria.includes(t)
      );
    };

  }

  aplicarFiltro(event: Event) {
    const valor = (event.target as HTMLInputElement).value;
    this.dataSource.filter = valor.trim().toLowerCase();
  }

  abrirDialogCrear(): void {
    const dialogRef = this.dialog.open(ItemsDialogComponent, {
      width: '600px',      
      
      data: { modo: 'crear' }
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado === 'guardado') this.cargarItems();
    });
  }

  abrirDialogEditar(item: Item): void {
  this.service.obtenerPorId(item.id).subscribe({
    next: (itemCompleto) => {
      this.dialog.open(ItemsDialogComponent, {
        width: '550px',
        data: {
          modo: 'editar',
          item: itemCompleto
        }
      });
    },
    error: () => Swal.fire('Error', 'No se pudo cargar el ítem', 'error')
  });
}


  toggle(i: Item) {
    this.service.toggleHabilitado(i.id).subscribe({
      next: (updatedItem) => {        
        i.habilitado = updatedItem.habilitado;
        Swal.fire(
          'Actualizado',
          `El item ahora está ${i.habilitado ? 'HABILITADO' : 'DESHABILITADO'}`,
          'success'
        );
      },
      error: () => Swal.fire('Error', 'No se pudo cambiar el estado', 'error')
    });
  }




  eliminarItem(id: number): void {
    Swal.fire({
      title: '¿Eliminar ítem?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.eliminarItem(id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Ítem eliminado correctamente', 'success');
            this.cargarItems();
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar el ítem', 'error')
        });
      }
    });
  }

}
