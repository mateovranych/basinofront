import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CondicionIva } from '../interfaces/CondicionIva';

@Injectable({
  providedIn: 'root'
})
export class CondicionesIvaService {

    private apiUrl = `${environment.apiUrl}/condicionesiva`;

  constructor(private http: HttpClient) {}

  // Obtener todas (con o sin búsqueda)
  getAll(search: string = ''): Observable<CondicionIva[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.http.get<CondicionIva[]>(this.apiUrl, { params });
  }

  getById(id: number): Observable<CondicionIva> {
    return this.http.get<CondicionIva>(`${this.apiUrl}/${id}`);
  }

  create(data: Partial<CondicionIva>): Observable<CondicionIva> {
    return this.http.post<CondicionIva>(this.apiUrl, data);
  }

  update(id: number, data: Partial<CondicionIva>): Observable<CondicionIva> {
    return this.http.put<CondicionIva>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  
}
