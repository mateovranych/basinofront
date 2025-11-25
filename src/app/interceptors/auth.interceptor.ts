import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth-service';
import { catchError, switchMap, throwError } from 'rxjs';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  
  let authReq = req.clone({ withCredentials: true });
  
  if (token) {
    authReq = authReq.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      
      if (
        error.status === 401 &&
        !req.url.includes('login') &&
        !req.url.includes('refresh')
      ) {
        return authService.refreshToken().pipe(
          switchMap((res) => {
            const newToken = res.token;

            if (!newToken) {
              authService.logout();
              return throwError(() => error);
            }
            
            const retryReq = req.clone({
              withCredentials: true,
              setHeaders: { Authorization: `Bearer ${newToken}` }
            });

            return next(retryReq);
          }),
          catchError((refreshErr) => {            
            authService.logout();
            return throwError(() => refreshErr);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
