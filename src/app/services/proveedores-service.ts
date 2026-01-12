import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Proveedor } from '../interfaces/Proveedor';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProveedoresService {


  private apiUrl = `${environment.apiUrl}/Proveedor`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(this.apiUrl);
  }

  getById(id: number): Observable<Proveedor> {
    return this.http.get<Proveedor>(`${this.apiUrl}/${id}`);
  }


  create(data: Partial<Proveedor>): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(this.apiUrl, data);
  }


  update(id: number, data: Partial<Proveedor>): Observable<{ mensaje: string }> {
    return this.http.put<{ mensaje: string }>(`${this.apiUrl}/${id}`, data);
  }


  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  cambiarEstado(id: number, activo: boolean) {
    return this.http.patch(
      `${this.apiUrl}/${id}/estado?activo=${activo}`,
      {}
    );
  }

  getProveedoresActivos() {
    return this.http.get<Proveedor[]>(`${this.apiUrl}/activos`);
  }



}
