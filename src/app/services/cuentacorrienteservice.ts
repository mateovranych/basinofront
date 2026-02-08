import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { MovimientoCuentaCorriente } from '../interfaces/CuentaCorriente/MovimientoCuentaCorriente';

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

}
