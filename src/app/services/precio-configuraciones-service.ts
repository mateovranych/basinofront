import { Injectable } from '@angular/core';
import { ConfiguracionDePrecioDTO } from '../interfaces/ConfiguracionDePrecioDTO';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class PrecioConfiguracionesService {

  private apiUrl = `${environment.apiUrl}/PrecioConfiguraciones`;

  constructor(private http: HttpClient) { }

  obtenerPorItem(itemId: number): Observable<ConfiguracionDePrecioDTO[]> {
    return this.http.get<ConfiguracionDePrecioDTO[]>(`${this.apiUrl}/item/${itemId}`);
  }

  actualizar(configId: number, porcentaje: number) {
    return this.http.put(`${this.apiUrl}/${configId}`, { porcentaje });
  }

}
