import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PresentacionDTO } from '../interfaces/Presentacion/PresentacionDTO';
import { Observable } from 'rxjs';
import { CrearPresentacionDTO } from '../interfaces/Presentacion/CrearPresentacionDTO';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PrestentacionService {
   private readonly apiUrl = `${environment.apiUrl}/UnidadMedida`;

  constructor(private http: HttpClient) {}


  getAll(): Observable<PresentacionDTO[]> {
    return this.http.get<PresentacionDTO[]>(this.apiUrl);
  }


  getById(id: number): Observable<PresentacionDTO> {
    return this.http.get<PresentacionDTO>(`${this.apiUrl}/${id}`);
  }


  crear(dto: CrearPresentacionDTO): Observable<PresentacionDTO> {
    return this.http.post<PresentacionDTO>(this.apiUrl, dto);
  }


  editar(id: number, dto: CrearPresentacionDTO): Observable<PresentacionDTO> {
    return this.http.put<PresentacionDTO>(`${this.apiUrl}/${id}`, dto);
  }


  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  
}
