import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { MovimientoCuentaCorriente } from '../interfaces/CuentaCorriente/MovimientoCuentaCorriente';
import { ImprimirHistorialCC } from '../interfaces/CuentaCorriente/ImprimirHistorialCC';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Cuentacorrienteservice {

  private api = environment.apiUrl + '/CuentaCorriente';

  constructor(private http: HttpClient) { }

  obtenerCuentaCorriente(clienteId: number) {
    return this.http.get<any>(`${this.api}/cliente/${clienteId}`);
  }

  pagar(dto: any) {
    return this.http.post(`${this.api}/pagar`, dto);
  }

  pagarFIFO(dto: any) {
    return this.http.post(`${this.api}/pagar-fifo`, dto);
  }

  pagarMultiple(dto: any) {
    return this.http.post(`${this.api}/pagar-multiple`, dto);
  }

  obtenerHistorial(clienteId: number) {
    return this.http.get<MovimientoCuentaCorriente[]>(
      `${this.api}/cliente/${clienteId}/historial`
    );
  }

  imprimirHistorial(dto: ImprimirHistorialCC) {
    return this.http.post(`${this.api}/imprimir-historial`, dto, {
      responseType: 'blob'
    });
  }

  getSaldosGenerales(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/saldo-general`);
  }

  exportarExcel(dto: any) {
    return this.http.post(
      `${this.api}/exportar-excel`,
      dto,
      { responseType: 'blob' }
    );
  }

  exportarSaldoGeneralExcel() {
    return this.http.get(
      `${this.api}/saldo-general/exportar-excel`,
      { responseType: 'blob' }
    );
  }

  exportarSaldoGeneralPDF() {
    return this.http.get(
      `${this.api}/saldo-general/exportar-pdf`,
      { responseType: 'blob' }
    );
  }

}
