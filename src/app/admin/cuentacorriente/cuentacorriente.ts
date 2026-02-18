import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import Swal from 'sweetalert2';

import { ClientesService } from '../../services/clientes-service';
import { Cuentacorrienteservice } from '../../services/cuentacorrienteservice';
import { RecibosService } from '../../services/recibos-service';
import { MatDialog } from '@angular/material/dialog';
import { Historialcc } from './historialcc/historialcc';


interface ClienteMin {
  id: number;
  razonSocial: string;
  condicionIVA: string;
  listaPrecioNombre: string;
}

interface PresupuestoCC {
  presupuestoId: number;
  fecha: string;
  monto: number;
  pagos: number;
  saldo: number;
  observacion?: string;

  // frontend only
  seleccionado?: boolean;
  montoPago?: number | null;
}

interface CuentaCorrienteCliente {
  clienteId: number;
  clienteNombre: string;
  saldoTotal: number;
  presupuestos: PresupuestoCC[];
}

/* ========================= */

@Component({
  selector: 'app-cuentacorriente',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    NgxMatSelectSearchModule,
    FormsModule
  ],
  templateUrl: './cuentacorriente.html',
  styleUrl: './cuentacorriente.scss'
})


export class Cuentacorriente implements OnInit {

  clientes: ClienteMin[] = [];
  clientesFiltrados: ClienteMin[] = [];
  clienteSeleccionado: ClienteMin | null = null;

  clienteIdCtrl = new FormControl<number | null>(null);
  filtroClientesCtrl = new FormControl('');

  cargandoClientes = false;

  pagando = false;

  cuentaCorriente: CuentaCorrienteCliente | null = null;
  cargandoCuenta = false;

  observacionPago: string = '';


  constructor(
    private clientesService: ClientesService,
    private cuentaCorrienteService: Cuentacorrienteservice,
    private reciboService: RecibosService,
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
      this.clienteSeleccionado =
        this.clientes.find(c => c.id === id) || null;

      if (id) {
        this.cargarCuentaCorriente(id);
      } else {
        this.cuentaCorriente = null;
      }
    });
  }


  cargarClientes(): void {
    this.cargandoClientes = true;
    this.clienteIdCtrl.disable();

    this.clientesService.getAll().subscribe({
      next: res => {
        this.clientes = res.map(c => ({
          id: c.id,
          razonSocial: c.razonSocial,
          condicionIVA: c.condicionIVA,
          listaPrecioNombre: c.listaPrecioNombre ?? '-'
        }));
        this.clientesFiltrados = [...this.clientes];
      },
      complete: () => {
        this.cargandoClientes = false;
        this.clienteIdCtrl.enable();
      }
    });
  }

  cargarCuentaCorriente(clienteId: number): void {
    this.cargandoCuenta = true;

    this.cuentaCorrienteService.obtenerCuentaCorriente(clienteId)
      .subscribe({
        next: (data: CuentaCorrienteCliente) => {
          data.presupuestos.forEach(p => {
            p.montoPago = null;
            p.seleccionado = false;
          });
          this.cuentaCorriente = data;
        },
        error: () => {
          Swal.fire('Error', 'No se pudo cargar la cuenta corriente', 'error');
          this.cuentaCorriente = null;
        },
        complete: () => this.cargandoCuenta = false
      });
  }

  pagarSeleccionados(): void {
    const seleccionados = this.presupuestosSeleccionados
      .filter(p => p.montoPago && p.montoPago > 0);

    if (!seleccionados.length) {
      Swal.fire('Atención', 'No hay pagos válidos', 'warning');
      return;
    }

    this.reciboService.crearReciboPagoMultiple({
      clienteId: this.clienteIdCtrl.value!,
      observacion: this.observacionPago,
      detalles: seleccionados.map(p => ({
        presupuestoId: p.presupuestoId,
        monto: p.montoPago!
      }))
    }).subscribe({
      next: res => {
        Swal.fire(
          'Pago registrado',
          `Recibo Nº ${res.reciboId}`,
          'success'
        );
        this.cargarCuentaCorriente(this.clienteIdCtrl.value!);
      },
      error: () => {
        Swal.fire('Error', 'No se pudo registrar el pago', 'error');
      }
    });

  }

  limpiarSeleccion(): void {
    this.cuentaCorriente?.presupuestos.forEach(p => {
      p.seleccionado = false;
      p.montoPago = null;
    });
  }

  toggleSeleccion(p: PresupuestoCC): void {
    p.seleccionado = !p.seleccionado;

    if (p.seleccionado && !p.montoPago) {
      p.montoPago = p.saldo;
    }

    if (!p.seleccionado) {
      p.montoPago = null;
    }
  }

  abrirHistorial(): void {
    if (!this.clienteIdCtrl.value) return;

    this.dialog.open(Historialcc, {
      width: '900px',
      maxHeight: '90vh',
      data: {
        clienteId: this.clienteIdCtrl.value,
        clienteNombre: this.clienteSeleccionado?.razonSocial
      }
    });
  }

  get presupuestosSeleccionados(): PresupuestoCC[] {
    return this.cuentaCorriente?.presupuestos
      .filter(p => p.seleccionado) ?? [];
  }

  get totalSeleccionado(): number {
    return this.presupuestosSeleccionados
      .reduce((acc, p) => acc + (p.montoPago ?? 0), 0);
  }
  


  bloquearFlechas(event: KeyboardEvent) {
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    event.preventDefault();
  }
}



}
