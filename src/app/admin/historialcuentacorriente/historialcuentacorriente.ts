import { Component, Input, SimpleChanges } from '@angular/core';
import { Cuentacorrienteservice } from '../../services/cuentacorrienteservice';
import { CommonModule } from '@angular/common';
import { MovimientoCuentaCorriente } from '../../interfaces/CuentaCorriente/MovimientoCuentaCorriente';

@Component({
  selector: 'app-historialcuentacorriente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historialcuentacorriente.html',
  styleUrl: './historialcuentacorriente.scss',
})
export class Historialcuentacorriente {

  @Input() clienteId!: number;
  @Input() clienteNombre!: string;

  movimientos: MovimientoCuentaCorriente[] = [];
  cargando = false;

  constructor(private cuentaCorrienteService: Cuentacorrienteservice) {


  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['clienteId'] && this.clienteId) {
      this.cargarHistorial();
    }
  }

  cargarHistorial(): void {
    this.cargando = true;

    this.cuentaCorrienteService
      .obtenerHistorial(this.clienteId)
      .subscribe({
        next: res => this.movimientos = res,
        complete: () => this.cargando = false
      });
  }

}
