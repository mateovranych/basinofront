import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Presupuesto } from '../interfaces/Presupuesto';
import { CrearPresupuesto } from '../interfaces/CrearPresupuesto';

@Injectable({
  providedIn: 'root'
})
export class PresupuestoService {

  private apiUrl = `${environment.apiUrl}/Presupuestos`;
   
  constructor(private http: HttpClient) {



  }

  obtenerPresupuestos(): Observable<Presupuesto[]> {
    return this.http.get<Presupuesto[]>(`${this.apiUrl}`);
  }

  crearPresupuesto(dto: CrearPresupuesto): Observable<Presupuesto> {
    return this.http.post<Presupuesto>(`${this.apiUrl}`, dto);
  }

  eliminarPresupuesto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }


}
