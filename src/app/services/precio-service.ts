import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PrecioConListaDTO } from '../interfaces/PrecioConListaDTO';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PreciosService {
  
  private apiUrl = `${environment.apiUrl}/Precios`;

  constructor(private http: HttpClient) {}

  obtenerPreciosDeItem(itemId: number): Observable<PrecioConListaDTO[]> {
    return this.http.get<PrecioConListaDTO[]>(`${this.apiUrl}/item/${itemId}`);
  }

  actualizarPrecio(precioId: number, valor: number) {
    return this.http.put(`${this.apiUrl}/${precioId}`, { valor });
  }

  obtenerPrecioParaCliente(itemId: number, clienteId: number): Observable<number> {
  return this.http.get<number>(
    `${this.apiUrl}/item/${itemId}/cliente/${clienteId}`
  );
}

}
