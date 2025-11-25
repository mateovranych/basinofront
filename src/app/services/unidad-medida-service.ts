import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { UnidadMedida } from '../interfaces/UnidadMedida';
import { CrearUnidadMedida } from '../interfaces/CrearUnidadMedida';

@Injectable({
  providedIn: 'root'
})
export class UnidadMedidaService {

  private apiUrl = `${environment.apiUrl}/UnidadMedida`;

  constructor(private http: HttpClient) {}

  obtenerUnidades(): Observable<UnidadMedida[]> {
    return this.http.get<UnidadMedida[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<UnidadMedida> {
    return this.http.get<UnidadMedida>(`${this.apiUrl}/${id}`);
  }

  crearUnidad(dto: CrearUnidadMedida): Observable<UnidadMedida> {
    return this.http.post<UnidadMedida>(this.apiUrl, dto);
  }

  editarUnidad(id: number, dto: CrearUnidadMedida): Observable<UnidadMedida> {
    return this.http.put<UnidadMedida>(`${this.apiUrl}/${id}`, dto);
  }

  eliminarUnidad(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
