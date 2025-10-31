import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { ItemsDialogComponent } from './items-dialog-component/items-dialog-component';
import { ItemsService } from '../../services/items-service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Item } from '../../interfaces/Item';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-items',
  imports: [
    CommonModule,
    MatDialogModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule

  ],
  templateUrl: './items.html',
  styleUrl: './items.scss'
})
export class Items {

  displayedColumns: string[] = ['codigo', 'descripcion', 'precioVenta', 'esServicio', 'categoria', 'acciones',  'requiereFrio',];
  items: Item[] = [];
  cargando = false;

  constructor(private service: ItemsService,
    private dialog: MatDialog) { }

  ngOnInit(): void {
    this.cargarItems();
  }

  cargarItems(): void {
    this.cargando = true;
    this.service.obtenerItems().subscribe({
      next: (res) => {
        this.items = res;
        this.cargando = false;
      },
      error: () => {
        Swal.fire('Error', 'No se pudieron cargar los items', 'error');
        this.cargando = false;
      }
    });
  }

  abrirDialogCrear(): void {
    const dialogRef = this.dialog.open(ItemsDialogComponent, {
      width: '550px',
      data: { modo: 'crear' }
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado === 'guardado') this.cargarItems();
    });
  }

  abrirDialogEditar(item: Item): void {
    const dialogRef = this.dialog.open(ItemsDialogComponent, {
      width: '550px',
      data: { modo: 'editar', item }
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado === 'guardado') this.cargarItems();
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
