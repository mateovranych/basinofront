import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Item } from '../interfaces/Items/Item';
import { Categoria } from '../interfaces/Categoria';
import { environment } from '../../environments/environment';
import { CrearItem } from '../interfaces/Items/CrearItem';
import { ItemConPrecios } from '../interfaces/Items/ItemConPrecios';
import { ItemMin } from '../interfaces/Items/ItemMin';

@Injectable({
  providedIn: 'root'
})
export class ItemsService {

  private apiUrl = `${environment.apiUrl}/Items`;
  private categoriasUrl = `${environment.apiUrl}/Categoria`;

  constructor(private http: HttpClient) { }

  obtenerItems(): Observable<Item[]> {
    return this.http.get<Item[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<Item> {
    return this.http.get<Item>(`${this.apiUrl}/${id}`);
  }


  obtenerCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.categoriasUrl);
  }

  crearItem(dto: CrearItem): Observable<Item> {
    return this.http.post<Item>(this.apiUrl, dto);
  }

  editarItem(id: number, dto: CrearItem): Observable<Item> {
    return this.http.put<Item>(`${this.apiUrl}/${id}`, dto);
  }

  eliminarItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  obtenerItemsConPrecios() {
    return this.http.get<ItemConPrecios[]>(`${this.apiUrl}/con-precios`);
  }

  obtenerParaPresupuesto() {
    return this.http.get<ItemMin[]>(`${environment.apiUrl}/Items/para-presupuesto`);
  }


  toggleHabilitado(id: number): Observable<Item> {
    return this.http.put<Item>(`${this.apiUrl}/${id}/toggle`, {});
  }



}
