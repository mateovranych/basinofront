import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import Swal from 'sweetalert2';
import { PresentacionDialog } from './presentacion-dialog/presentacion-dialog';
import { PrestentacionService } from '../../services/prestentacion-service';
import { PresentacionDTO } from '../../interfaces/Presentacion/PresentacionDTO';

@Component({
  selector: 'app-presentacion',
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
  templateUrl: './presentacion.html',
  styleUrl: './presentacion.scss'
})
export class Presentacion {

   displayedColumns: string[] = ['id', 'nombre', 'acciones'];
  presentacion: PresentacionDTO[] = [];
  cargando = false;

  constructor(private service: PrestentacionService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.cargarPresentaciones();
  }

  cargarPresentaciones(): void {
    this.cargando = true;
    this.service.getAll().subscribe({
      next: (res) => {
        this.presentacion = res;
        this.cargando = false;
      },
      error: () => {
        Swal.fire('Error', 'No se pudieron cargar las categorías', 'error');
        this.cargando = false;
      }
    });
  }

  abrirDialogCrear(): void {
    const dialogRef = this.dialog.open(PresentacionDialog, {      
      data: { modo: 'crear' }
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado === 'guardado') this.cargarPresentaciones();
    });
  }

  abrirDialogEditar(presentacion: PresentacionDTO): void {
    const dialogRef = this.dialog.open(PresentacionDialog, {
      
      data: { modo: 'editar', presentacion }
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado === 'guardado') this.cargarPresentaciones();
    });
  }

  eliminarPresentacion(id: number): void {
    Swal.fire({
      title: '¿Eliminar presentacion?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.eliminar(id).subscribe({
          next: () => {
            Swal.fire('Eliminada', 'Presentacion eliminada correctamente', 'success');
            this.cargarPresentaciones();
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar la presentacion', 'error')
        });
      }
    });
  }


}
