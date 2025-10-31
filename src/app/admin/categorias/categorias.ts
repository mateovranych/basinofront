import { Component } from '@angular/core';
import { CategoriasService } from '../../services/categorias-service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Categoria } from '../../interfaces/Categoria';
import { DialogCategoriaComponent } from './dialog-categoria-component/dialog-categoria-component';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatProgressBarModule

  ],
  templateUrl: './categorias.html',
  styleUrl: './categorias.scss'
})
export class Categorias {

  displayedColumns: string[] = ['id', 'nombre', 'acciones'];
  categorias: Categoria[] = [];
  cargando = false;

  constructor(private service: CategoriasService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.cargando = true;
    this.service.obtenerCategorias().subscribe({
      next: (res) => {
        this.categorias = res;
        this.cargando = false;
      },
      error: () => {
        Swal.fire('Error', 'No se pudieron cargar las categorías', 'error');
        this.cargando = false;
      }
    });
  }

  abrirDialogCrear(): void {
    const dialogRef = this.dialog.open(DialogCategoriaComponent, {      
      data: { modo: 'crear' }
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado === 'guardado') this.cargarCategorias();
    });
  }

  abrirDialogEditar(categoria: Categoria): void {
    const dialogRef = this.dialog.open(DialogCategoriaComponent, {
      
      data: { modo: 'editar', categoria }
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado === 'guardado') this.cargarCategorias();
    });
  }

  eliminarCategoria(id: number): void {
    Swal.fire({
      title: '¿Eliminar categoría?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.eliminarCategoria(id).subscribe({
          next: () => {
            Swal.fire('Eliminada', 'Categoría eliminada correctamente', 'success');
            this.cargarCategorias();
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar la categoría', 'error')
        });
      }
    });
  }

}
