import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { environment } from '../../environments/environment';

export interface EmisorConfig {
  condicionIvaEmisor: 'RI' | 'Monotributista' | 'Exento' | string;
  cuit: string;
  puntoVenta: number;
}

@Injectable({ providedIn: 'root' })
export class ConfiguracionService {
  private readonly apiUrl = `${environment.apiUrl}/configuracion`;
  private emisor$: Observable<EmisorConfig> | null = null;

  constructor(private http: HttpClient) {}

  getEmisor(): Observable<EmisorConfig> {
    if (!this.emisor$) {
      this.emisor$ = this.http
        .get<EmisorConfig>(`${this.apiUrl}/emisor`)
        .pipe(shareReplay(1));
    }
    return this.emisor$;
  }
}
