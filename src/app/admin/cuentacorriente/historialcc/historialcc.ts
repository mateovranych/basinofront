import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { Cuentacorrienteservice } from '../../../services/cuentacorrienteservice';
import { MovimientoCuentaCorriente } from '../../../interfaces/CuentaCorriente/MovimientoCuentaCorriente';





@Component({
  selector: 'app-historialcc',
  standalone : true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './historialcc.html',
  styleUrl: './historialcc.scss',
})
export class Historialcc implements OnInit {

  movimientos: MovimientoCuentaCorriente[] = [];
  cargando = false;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { clienteId: number; clienteNombre: string },
    private cuentaCorrienteService: Cuentacorrienteservice
  ) {}

  ngOnInit(): void {
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    this.cargando = true;

    this.cuentaCorrienteService
      .obtenerHistorial(this.data.clienteId)
      .subscribe({
        next: res => this.movimientos = res,
        complete: () => this.cargando = false
      });
  }
}


