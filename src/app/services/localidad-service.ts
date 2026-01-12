import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Localidad } from '../interfaces/Localidad/Localidad';
import { CrearLocalidad } from '../interfaces/Localidad/CrearLocalidad';
import { EditarLocalidad } from '../interfaces/Localidad/EditarLocalidad';

@Injectable({
  providedIn: 'root'
})
export class LocalidadService {

  private apiUrl = `${environment.apiUrl}/localidades`;

  constructor(private http: HttpClient) { }

  obtenerLocalidades(): Observable<Localidad[]> {
    return this.http.get<Localidad[]>(this.apiUrl);
  }

  crearLocalidad(dto: CrearLocalidad): Observable<void> {
    return this.http.post<void>(this.apiUrl, dto);
  }

  editarLocalidad(id: number, dto: EditarLocalidad): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, dto);
  }

  eliminarLocalidad(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

}
