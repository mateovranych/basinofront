import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReciboListadoDTO } from '../../interfaces/Recibos/ReciboListadoDTO';
import { ClientesService } from '../../services/clientes-service';
import { RecibosService } from '../../services/recibos-service';
import Swal from 'sweetalert2';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatDialog } from '@angular/material/dialog';
import { Recibopdf } from './recibopdf/recibopdf';


interface ClienteMin {
  id: number;
  razonSocial: string;
}

@Component({
  selector: 'app-recibos',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    NgxMatSelectSearchModule,
    FormsModule,

  ],
  templateUrl: './recibos.html',
  styleUrl: './recibos.scss'
})
export class Recibos implements OnInit {

  clientes: ClienteMin[] = [];
  clientesFiltrados: ClienteMin[] = [];

  clienteIdCtrl = new FormControl<number | null>(null);
  filtroClientesCtrl = new FormControl('');

  cargandoClientes = false;
  cargandoRecibos = false;

  recibos: ReciboListadoDTO[] = [];

  constructor(
    private clientesService: ClientesService,
    private recibosService: RecibosService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.cargarClientes();

    this.filtroClientesCtrl.valueChanges.subscribe(valor => {
      const filtro = (valor || '').toLowerCase();
      this.clientesFiltrados = this.clientes.filter(c =>
        c.razonSocial.toLowerCase().includes(filtro)
      );
    });

    this.clienteIdCtrl.valueChanges.subscribe(id => {
      this.recibos = [];
      if (id) this.cargarRecibos(id);
    });
  }

  cargarClientes(): void {
    this.cargandoClientes = true;
    this.clienteIdCtrl.disable();

    this.clientesService.getAll().subscribe({
      next: res => {
        this.clientes = res.map(c => ({ id: c.id, razonSocial: c.razonSocial }));
        this.clientesFiltrados = [...this.clientes];
      },
      error: () => Swal.fire('Error', 'No se pudieron cargar los clientes', 'error'),
      complete: () => {
        this.cargandoClientes = false;
        this.clienteIdCtrl.enable();
      }
    });
  }

  cargarRecibos(clienteId: number): void {
    this.cargandoRecibos = true;

    this.recibosService.obtenerPorCliente(clienteId).subscribe({
      next: data => this.recibos = data,
      error: () => Swal.fire('Error', 'No se pudieron cargar los recibos', 'error'),
      complete: () => this.cargandoRecibos = false
    });
  }

  imprimir(reciboId: number): void {
    this.recibosService.obtenerPdf(reciboId).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        window.open(url);
      },
      error: () => Swal.fire('Error', 'No se pudo descargar el PDF', 'error')
    });
  }

  verRecibo(reciboId: number): void {
    this.dialog.open(Recibopdf, {
      data: { reciboId },
      width: '900px',
      maxWidth: '95vw'
    });
  }


}
