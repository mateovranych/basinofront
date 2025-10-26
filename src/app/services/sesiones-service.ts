import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { environment } from '../../environments/environment';
import { SesionActiva } from '../interfaces/SesionActiva';

@Injectable({
  providedIn: 'root'
})
export class SesionesService {

  // URL base para el nuevo controlador de administración
  private apiUrl = `${environment.apiUrl}/AdminSessions`; 

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todas las sesiones activas del sistema.
   * Requiere autenticación y rol de Admin.
   */
  getAll(): Observable<SesionActiva[]> {
    // La respuesta del API viene como objeto plano, pero Angular/TS necesita tratar las fechas
    // El backend debe devolver el campo "fechaInicio" y "fechaExpiracion" como DateTime
    return this.http.get<SesionActiva[]>(this.apiUrl);
  }

  /**
   * Revoca una sesión específica por su identificador único (RefreshTokenId).
   * @param refreshTokenId El TokenHash de la sesión a revocar.
   */
  revoke(refreshTokenId: string): Observable<any> {
    const url = `${this.apiUrl}/revoke/${refreshTokenId}`;
    // Usamos POST sin cuerpo (body) o con un cuerpo vacío, ya que la acción se define en la URL.
    return this.http.post(url, {});
  }

  /**
   * Revoca todas las sesiones activas de un usuario específico.
   * @param usuarioId El GUID del usuario cuyas sesiones se revocarán.
   */
  revokeAllForUser(usuarioId: string): Observable<any> {
    const url = `${this.apiUrl}/revokeAll/${usuarioId}`;
    return this.http.post(url, {});
  }
  
  /**
   * Lógica de reactivación: En el backend, esto es muy complejo (requiere emitir un nuevo
   * Refresh Token o cambiar la lógica de validación). 
   * Por ahora, mantenemos un método de advertencia.
   */
  enableSession(usuarioId: string): Observable<any> {
    // ESTO ES SOLO UN MOCK TEMPORAL. La habilitación de sesión en tiempo real es compleja.
    console.warn('Advertencia: El método enableSession aún no tiene una implementación real en el backend.');
    return of({ success: false }); 
  }
  
}
