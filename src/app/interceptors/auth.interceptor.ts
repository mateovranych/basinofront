// src/app/interceptors/auth.interceptor.ts

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { Router } from '@angular/router';
import { catchError, throwError, switchMap, filter, take } from 'rxjs'; // 🔑 Importaciones clave
import { HttpErrorResponse, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth-service';

// Helper para añadir el Access Token a una petición
const addTokenHeader = (request: HttpRequest<any>, token: string | null): HttpRequest<any> => {
  if (token) {
    return request.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }
  return request;
};


export const AuthInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Añadir el Access Token inicial a la solicitud
  let authReq = addTokenHeader(req, authService.getToken());

  // 2. Ejecutar la solicitud y capturar errores
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el Access Token expiró (401) Y NO es la llamada a /refresh
      if (error.status === 401 && !authReq.url.includes('/refresh')) {
        
        // 🔑 Patrón de Refresco (Reintento)
        if (!authService.isRefreshing) {
          
          authService.isRefreshing = true;
          authService.refreshTokenSubject.next(null); // Marcar que estamos esperando el nuevo token
          console.warn('⚠️ Access Token expirado. Iniciando refresco...');

          // 🔑 Llamar al servicio de refresh
          return authService.refreshToken().pipe(
            switchMap((response: any) => {
              // Refresh exitoso:
              authService.isRefreshing = false;
              authService.refreshTokenSubject.next(response.token); // Emitir el nuevo token a los pendientes

              // Reintentar la solicitud original con el nuevo token
              return next(addTokenHeader(req, response.token));
            }),
            catchError((errRefresh: any) => {
              // Refresh fallido (token revocado o expirado)
              authService.isRefreshing = false;
              authService.logout();
              router.navigate(['/login']);
              return throwError(() => errRefresh);
            })
          );
        } else {
          // Si ya hay una solicitud de refresco en curso:
          console.log('⏳ Refresco en curso. Poniendo la solicitud en espera...');

          // Esperar a que el BehaviorSubject emita el nuevo token (o null si falla)
          return authService.refreshTokenSubject.pipe(
            filter(token => token !== null), // Esperar hasta que se emita un token
            take(1), // Tomar sólo el primer valor
            switchMap(token => {
              // Reintentar la solicitud original con el nuevo token
              return next(addTokenHeader(req, token));
            })
          );
        }
      }
      
      // Manejo de otros errores (403, 500, etc.)
      if (error.status === 403) {
        console.warn('⚠️ Sin permisos suficientes.');
        router.navigate(['/unauthorized']);
      } else if (error.status === 404) {
         console.warn('⚠️ Recurso no encontrado.');
         router.navigate(['/not-found']);
      }

      return throwError(() => error);
    })
  );
};