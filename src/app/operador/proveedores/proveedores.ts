import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import Swal from 'sweetalert2';

import { Proveedor } from '../../interfaces/Proveedor';
import { ProveedoresService } from '../../services/proveedores-service';
import { ProveedoresDialog } from './proveedores-dialog/proveedores-dialog';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './proveedores.html',
  styleUrl: './proveedores.scss'
})
export class Proveedores implements OnInit, AfterViewInit {

  displayedColumns: string[] = [
    'razonSocial',
    'cuit',
    'telefono',
    'condicionIVA',
    'esActivo',
    'acciones'
  ];

  dataSource = new MatTableDataSource<Proveedor>([]);
  searchControl = new FormControl('');

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private service: ProveedoresService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {

    // 🔎 filtro personalizado
    this.dataSource.filterPredicate = (data: Proveedor, filter: string) => {
      const term = filter.trim().toLowerCase();

      return (
        data.razonSocial?.toLowerCase().includes(term) ||
        data.cuit?.toLowerCase().includes(term) ||
        data.telefono?.toLowerCase().includes(term)
      );
    };

    this.cargar();

    this.searchControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe(value => {
        this.dataSource.filter = (value ?? '').trim().toLowerCase();
        if (this.paginator) this.paginator.firstPage();
      });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  cargar(): void {
    this.service.getAll().subscribe({
      next: (res) => {
        this.dataSource.data = res;
        if (this.paginator) this.dataSource.paginator = this.paginator;
      },
      error: () => Swal.fire('Error', 'No se pudieron cargar los proveedores', 'error')
    });
  }

  nuevo(): void {
    this.dialog.open(ProveedoresDialog, {
      width: '600px',
      disableClose: true
    }).afterClosed().subscribe(ok => ok && this.cargar());
  }

  editar(p: Proveedor): void {
    this.service.getById(p.id).subscribe({
      next: (detalle) => {
        this.dialog.open(ProveedoresDialog, {
          width: '600px',
          data: detalle,
          disableClose: true
        }).afterClosed().subscribe(ok => ok && this.cargar());
      },
      error: () => Swal.fire('Error', 'No se pudo cargar el proveedor', 'error')
    });
  }

  eliminar(p: Proveedor): void {
    Swal.fire({
      title: `¿Eliminar ${p.razonSocial}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(r => {
      if (r.isConfirmed) {
        this.service.delete(p.id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Proveedor eliminado', 'success');
            this.cargar();
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar', 'error')
        });
      }
    });
  }
}
