import { Component, OnInit, ViewChild } from '@angular/core';
import { Cliente } from '../../interfaces/Cliente';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClientesService } from '../../services/clientes-service';
import Swal from 'sweetalert2';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { debounceTime } from 'rxjs';
import { ClientedialogStandalone } from './clientedialog-standalone/clientedialog-standalone';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatMenuModule} from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatMenuModule,
    MatInputModule,
    MatPaginatorModule,
    MatDialogModule,
    MatButtonModule,    
    MatIconModule
  ],
  templateUrl: './clientes.html',
  styleUrl: './clientes.scss'
})
export class Clientes implements OnInit{
  
  displayedColumns: string[] = [
    'razonSocial',
    'cuit',
    'domicilio',
    'telefono',
    'email',
    'condicionIVA',
    'tieneCuentaCorriente',
    'acciones',
  ];

  dataSource = new MatTableDataSource<Cliente>([]);
  searchControl = new FormControl('');

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private clienteService: ClientesService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.cargarClientes();

    this.searchControl.valueChanges.pipe(debounceTime(400)).subscribe(() => {
      this.cargarClientes();
    });
  }

  cargarClientes(): void {
    const term = this.searchControl.value?.trim() || '';
    this.clienteService.getAll(term).subscribe({
      next: (res) => {
        this.dataSource.data = res;
        if (this.paginator) this.dataSource.paginator = this.paginator;
      },
      error: (err) => console.error(err),
    });
  }

  abrirDialogoNuevo() {
  const dialogRef = this.dialog.open(ClientedialogStandalone, {
    width: '600px',
    data: null,
    disableClose: true
  });

  dialogRef.afterClosed().subscribe((result) => {
    if (result) this.cargarClientes();
  });
}



editarCliente(cliente: Cliente) {
  const dialogRef = this.dialog.open(ClientedialogStandalone, {    
    
    data: cliente,
    disableClose: true
  });

  dialogRef.afterClosed().subscribe((result) => {
    if (result) this.cargarClientes();
  });
}


  eliminarCliente(cliente: Cliente) {
    Swal.fire({
      title: `¿Eliminar ${cliente.razonSocial}?`,
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.clienteService.delete(cliente.id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'El cliente fue eliminado.', 'success');
            this.cargarClientes();
          },
          error: (err) => {
            Swal.fire('Error', 'No se pudo eliminar el cliente.', 'error');
            console.error(err);
          },
        });
      }
    });
  }

}
