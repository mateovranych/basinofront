import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Provincia } from '../interfaces/Provincia/Provincia';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CrearProvincia } from '../interfaces/Provincia/CrearProvincia';

@Injectable({
  providedIn: 'root'
})
export class ProvinciaService {

  private apiUrl = `${environment.apiUrl}/provincias`;

  constructor(private http: HttpClient) {}

  obtenerProvincias(): Observable<Provincia[]> {
    return this.http.get<Provincia[]>(this.apiUrl);
  }

  crearProvincia(dto: CrearProvincia): Observable<void> {
    return this.http.post<void>(this.apiUrl, dto);
  }

  eliminarProvincia(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  
}
