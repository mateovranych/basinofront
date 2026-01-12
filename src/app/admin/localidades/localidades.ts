import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { LocalidadesDialog } from './localidades-dialog/localidades-dialog';
import { LocalidadService } from '../../services/localidad-service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Localidad } from '../../interfaces/Localidad/Localidad';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-localidades',
  imports: [
    CommonModule,
    MatDialogModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule],
  templateUrl: './localidades.html',
  styleUrl: './localidades.scss'
})
export class Localidades {

  localidades: Localidad[] = [];
  displayedColumns = ['id', 'nombre', 'provincia', 'acciones'];

  constructor(
    private service: LocalidadService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.service.obtenerLocalidades().subscribe(res => this.localidades = res);
  }

  abrirCrear() {
    const ref = this.dialog.open(LocalidadesDialog, {
      data: { modo: 'crear' }
    });

    ref.afterClosed().subscribe(r => {
      if (r === 'guardado') this.cargar();
    });
  }

  abrirEditar(localidad: Localidad) {
    const ref = this.dialog.open(LocalidadesDialog, {
      data: { modo: 'editar', localidad }
    });

    ref.afterClosed().subscribe(r => {
      if (r === 'guardado') this.cargar();
    });
  }


  eliminar(id: number) {
    Swal.fire({
      title: '¿Eliminar localidad?',
      icon: 'warning',
      showCancelButton: true
    }).then(r => {
      if (r.isConfirmed) {
        this.service.eliminarLocalidad(id).subscribe(() => {
          Swal.fire('Eliminada', '', 'success');
          this.cargar();
        });
      }
    });
  }

}
