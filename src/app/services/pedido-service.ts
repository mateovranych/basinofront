import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Pedido } from '../interfaces/Pedido';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CrearPedidoDTO } from '../interfaces/CrearPedidoDTO';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {

  private apiUrl = `${environment.apiUrl}/Pedido`;

  constructor(private http: HttpClient) { }

   obtenerPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.apiUrl);
  }

  crearPedido(dto: CrearPedidoDTO): Observable<Pedido> {
    return this.http.post<Pedido>(this.apiUrl, dto);
  }

  eliminarPedido(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  actualizarEstado(id: number, estadoId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/estado/${estadoId}`, {});
  }

}
