import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CondicionesIvaDialog } from './condiciones-iva-dialog/condiciones-iva-dialog';
import { CondicionesIvaService } from '../../services/condiciones-iva-service';
import { debounceTime } from 'rxjs';
import Swal from 'sweetalert2';
import { CondicionIva } from '../../interfaces/CondicionIva';

@Component({
  selector: 'app-condiciones-iva',  
  standalone:true,
  imports:[  
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatMenuModule,
    MatPaginatorModule,
    CondicionesIvaDialog
  ],
  templateUrl: './condiciones-iva.html',
  styleUrl: './condiciones-iva.scss'
})
export class CondicionesIva implements OnInit{

  displayedColumns: string[] = ['nombre', 'codigoAfip', 'acciones'];
  dataSource = new MatTableDataSource<CondicionIva>([]);
  searchControl = new FormControl('');

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private condicionesIvaService: CondicionesIvaService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.cargarCondiciones();
    this.searchControl.valueChanges.pipe(debounceTime(400)).subscribe(() => {
      this.cargarCondiciones();
    });
  }

  cargarCondiciones(): void {
    const term = this.searchControl.value?.trim() || '';
    this.condicionesIvaService.getAll(term).subscribe({
      next: (res) => {
        this.dataSource.data = res;
        if (this.paginator) this.dataSource.paginator = this.paginator;
      },
      error: (err) => console.error(err),
    });
  }

  abrirDialogoNueva(): void {
    const dialogRef = this.dialog.open(CondicionesIvaDialog, { data: null });
    dialogRef.afterClosed().subscribe((res) => {
      if (res) this.cargarCondiciones();
    });
  }

  editar(condicion: CondicionIva): void {
    const dialogRef = this.dialog.open(CondicionesIvaDialog, { data: condicion });
    dialogRef.afterClosed().subscribe((res) => {
      if (res) this.cargarCondiciones();
    });
  }

  eliminar(condicion: CondicionIva): void {
    Swal.fire({
      title: `¿Eliminar "${condicion.nombre}"?`,
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.condicionesIvaService.delete(condicion.id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Condición IVA eliminada.', 'success');
            this.cargarCondiciones();
          },
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar.', 'error');
          },
        });
      }
    });
  }

}
