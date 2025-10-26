import { Injectable } from '@angular/core';
import { Cliente } from '../interfaces/Cliente';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {

   private apiUrl = `${environment.apiUrl}/Cliente`;

  constructor(private http: HttpClient) {}

  getAll(search: string = ''): Observable<Cliente[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.http.get<Cliente[]>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/${id}`);
  }

  create(data: Partial<Cliente>): Observable<Cliente> {
    return this.http.post<Cliente>(this.apiUrl, data);
  }

  update(id: number, data: Partial<Cliente>): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  
}
