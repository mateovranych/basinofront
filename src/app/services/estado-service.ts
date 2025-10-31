import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Estado } from '../interfaces/Estado';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CrearEstadoDTO } from '../interfaces/CrearEstadoDTO';

@Injectable({
  providedIn: 'root'
})
export class EstadoService {

    private apiUrl = `${environment.apiUrl}/Estados`;


    constructor(private http: HttpClient) {}

  obtenerTodos(): Observable<Estado[]> {
    return this.http.get<Estado[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<Estado> {
    return this.http.get<Estado>(`${this.apiUrl}/${id}`);
  }

  crear(dto: CrearEstadoDTO): Observable<Estado> {
    return this.http.post<Estado>(this.apiUrl, dto);
  }
  
  editar(id: number, dto: CrearEstadoDTO): Observable<Estado> {
    return this.http.put<Estado>(`${this.apiUrl}/${id}`, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  
}
