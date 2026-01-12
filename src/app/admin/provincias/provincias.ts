import { Component } from '@angular/core';
import { ProvinciasDialog } from './provincias-dialog/provincias-dialog';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProvinciaService } from '../../services/provincia-service';
import { Provincia } from '../../interfaces/Provincia/Provincia';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-provincias',
  imports: [
    CommonModule,
    MatDialogModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './provincias.html',
  styleUrl: './provincias.scss'
})
export class Provincias {

  provincias: Provincia[] = [];
  displayedColumns = ['id', 'nombre', 'acciones'];

  constructor(
    private service: ProvinciaService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.service.obtenerProvincias().subscribe(res => this.provincias = res);
  }

  abrirCrear() {
    const ref = this.dialog.open(ProvinciasDialog, {
      data: { modo: 'crear' }
    });

    ref.afterClosed().subscribe(r => {
      if (r === 'guardado') this.cargar();
    });
  }

  eliminar(id: number) {
    Swal.fire({
      title: '¿Eliminar provincia?',
      icon: 'warning',
      showCancelButton: true
    }).then(r => {
      if (r.isConfirmed) {
        this.service.eliminarProvincia(id).subscribe(() => {
          Swal.fire('Eliminada', '', 'success');
          this.cargar();
        });
      }
    });
  }

}
