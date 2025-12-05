import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { ListaPrecio } from '../interfaces/ListaPrecio';


@Injectable({ providedIn: 'root' })
export class ListasPrecioService {

  private baseUrl = environment.apiUrl + '/ListasPrecio';

  constructor(private http: HttpClient) {}

  getAll(): Observable<ListaPrecio[]> {
    return this.http.get<ListaPrecio[]>(this.baseUrl);
  }

  getById(id: number): Observable<ListaPrecio> {
    return this.http.get<ListaPrecio>(`${this.baseUrl}/${id}`);
  }
}
