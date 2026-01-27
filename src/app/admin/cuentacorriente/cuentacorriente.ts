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



type ClienteMin = {
  id: number;
  razonSocial: string;
  condicionIVA: string;
  listaPrecioNombre: string;
};

@Component({
  selector: 'app-cuentacorriente',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    NgxMatSelectSearchModule,
    FormsModule],
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

  cuentaCorriente: any = null;
  cargandoCuenta = false;

  constructor(
    private clientesService: ClientesService,
    private cuentaCorrienteService: Cuentacorrienteservice
  ) {}

  // ============================
  // INIT
  // ============================
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

  // ============================
  // DATA LOAD
  // ============================
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
        next: data => {
          // agregamos campo auxiliar para input de pago
          data.presupuestos.forEach((p: any) => p.montoPago = null);
          this.cuentaCorriente = data;
        },
        error: () => {
          Swal.fire('Error', 'No se pudo cargar la cuenta corriente', 'error');
          this.cuentaCorriente = null;
        },
        complete: () => this.cargandoCuenta = false
      });
  }

  // ============================
  // ACCIONES
  // ============================
  pagarPresupuesto(p: any): void {
    if (!p.montoPago || p.montoPago <= 0) {
      Swal.fire('Atención', 'Ingresá un monto válido', 'warning');
      return;
    }

    this.cuentaCorrienteService.pagar({
      clienteId: this.clienteIdCtrl.value,
      presupuestoId: p.presupuestoId,
      monto: p.montoPago,
      observacion: 'Pago desde cuenta corriente'
    }).subscribe({
      next: () => {
        Swal.fire('Ok', 'Pago registrado', 'success');
        this.cargarCuentaCorriente(this.clienteIdCtrl.value!);
      },
      error: () => {
        Swal.fire('Error', 'No se pudo registrar el pago', 'error');
      }
    });
  }


}



