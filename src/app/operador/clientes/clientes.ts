import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Cliente } from '../../interfaces/Cliente';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClientesService } from '../../services/clientes-service';
import Swal from 'sweetalert2';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { debounceTime } from 'rxjs';
import { ClientedialogStandalone } from './clientedialog-standalone/clientedialog-standalone';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { SignalRService } from '../../services/signal-rservice';

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
    MatSortModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './clientes.html',
  styleUrl: './clientes.scss'
})
export class Clientes implements OnInit, AfterViewInit {

  displayedColumns: string[] = [
    'razonSocial',
    'cuit',
    'domicilio',
    'telefono',
    'email',
    'condicionIVA',
    'listaPrecioNombre',
    'tieneCuentaCorriente',
    'esActivo',
    'acciones',
  ];

  dataSource = new MatTableDataSource<Cliente>([]);
  searchControl = new FormControl('');

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private clienteService: ClientesService,
    private dialog: MatDialog,
    private signal: SignalRService
  ) {}

  ngOnInit(): void {
    // 🔎 Filtro personalizado
    this.dataSource.filterPredicate = (data: Cliente, filter: string): boolean => {
      const term = filter.trim().toLowerCase();

      const razon = data.razonSocial?.toLowerCase() || '';
      const cuit = data.cuit?.toLowerCase() || '';
      const email = data.email?.toLowerCase() || '';
      const telefono = data.telefono?.toLowerCase() || '';
      const domicilio = data.domicilio?.toLowerCase() || '';

      return (
        razon.includes(term) ||
        cuit.includes(term) ||
        email.includes(term) ||
        telefono.includes(term) ||
        domicilio.includes(term)
      );
    };

    this.cargarClientes();    


    this.signal.listen("actualizar", modulo => {
      if (modulo === "clientes") {
        this.cargarClientes();
      }
    });

    // Debounce para evitar spam en el filtro
    this.searchControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe(value => {
        this.dataSource.filter = (value ?? '').trim().toLowerCase();
        if (this.paginator) this.paginator.firstPage();
      });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  cargarClientes(): void {
    this.clienteService.getAll().subscribe({
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
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.cargarClientes();
    });
  }

  editarCliente(cliente: Cliente) {
    const dialogRef = this.dialog.open(ClientedialogStandalone, {
      width: '600px',
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
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar el cliente.', 'error');
          },
        });
      }
    });
  }

}
