// services/factura-service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Factura,  } from '../interfaces/Factura/Factura';
import { environment } from '../../environments/environment';
import { CrearFacturaDTO } from '../interfaces/Factura/CrearFacturaDTO';

@Injectable({ providedIn: 'root' })
export class FacturaService {

  private url = `${environment.apiUrl}/Facturas`;

  constructor(private http: HttpClient) {}

  obtenerFacturas(): Observable<Factura[]> {
    return this.http.get<Factura[]>(this.url);
  }

  obtenerPorId(id: number): Observable<Factura> {
    return this.http.get<Factura>(`${this.url}/${id}`);
  }

  crearFactura(dto: CrearFacturaDTO): Observable<Factura> {
    return this.http.post<Factura>(this.url, dto);
  }

  reintentarAutorizacion(id: number): Observable<Factura> {
    return this.http.post<Factura>(`${this.url}/${id}/reintentar`, {});
  }

  validarEliminar(id: number): Observable<any> {
    return this.http.get(`${this.url}/${id}/validar-eliminar`);
  }

  eliminarFactura(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  descargarPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.url}/${id}/pdf`, { responseType: 'blob' });
  }
}