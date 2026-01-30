import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Presupuesto } from '../interfaces/Presupuesto/Presupuesto';
import { CrearPresupuesto } from '../interfaces/Presupuesto/CrearPresupuesto';
import { ValidacionEliminarPresupuesto } from '../interfaces/Presupuesto/ValidacionEliminarPresupuesto';

@Injectable({
  providedIn: 'root'
})
export class PresupuestoService {

  private apiUrl = `${environment.apiUrl}/Presupuestos`;

  constructor(private http: HttpClient) { }

  obtenerPresupuestos(): Observable<Presupuesto[]> {
    return this.http.get<Presupuesto[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<Presupuesto> {
    return this.http.get<Presupuesto>(`${this.apiUrl}/${id}`);
  }

  crearPresupuesto(dto: CrearPresupuesto): Observable<Presupuesto> {
    return this.http.post<Presupuesto>(this.apiUrl, dto);
  }

  validarEliminar(id: number): Observable<ValidacionEliminarPresupuesto> {
    return this.http.get<ValidacionEliminarPresupuesto>(`${this.apiUrl}/${id}/validar-eliminar`);
  }

  eliminarPresupuesto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  descargarPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/pdf`, {
      responseType: 'blob'
    });
  }

}
