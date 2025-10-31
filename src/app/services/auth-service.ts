import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { LoginRequest } from '../interfaces/LoginRequest';
import { AuthResponse } from '../interfaces/AuthResponse';
import { environment } from '../../environments/environment';


import * as signalR from '@microsoft/signalr'; // 🔑 Importar SignalR
import {  Router } from '@angular/router';
import { ReactivarSesionDTO } from '../interfaces/ReactivarSesionDTO';


@Injectable({
  providedIn: 'root'
})
export class AuthService {


  private hubConnection!: signalR.HubConnection;

  private apiUrl = `${environment.apiUrl}/Auth`;
  private tokenKey = 'auth_token';
  private refreshKey = 'refresh_token';


  public isRefreshing = false;
  public refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);



  constructor(private http: HttpClient, private router:Router) {
      this.iniciarConexionSignalR();

  }


  private iniciarConexionSignalR(): void {
        const userId = this.getUserId(); // Asume que tienes un método para obtener el ID
        if (!userId) {
            console.log("No hay ID de usuario. No se inicia SignalR.");
            return;
        }

        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${environment.apiUrl}/hubs/auth`) // Usa la misma ruta que mapeaste
            .build();

        this.hubConnection
            .start()
            .then(() => {
                console.log('🔗 Conexión SignalR iniciada con éxito.');
                
                // 🔑 CLAVE: Unirse al grupo específico del usuario
                this.hubConnection.invoke('AddToGroup', `User-${userId}`); 
                
                // 🔑 CLAVE: Manejar el evento de revocación
                this.hubConnection.on('TokenRevoked', (message) => {
                    console.warn(`🚨 Evento de revocación recibido: ${message}`);
                    this.forzarLogout(); // Cierra sesión inmediatamente
                });
            })
            .catch(err => console.error('❌ Error al iniciar SignalR: ', err));
    }
    
    public getUserId(): string | null {
        const token = this.getToken();
        if (!token) return null;
        try {
            const decoded: any = jwtDecode(token);
            // Asegúrate de que el claim "id" es el que tiene el Guid del usuario
            return decoded.id; 
        } catch {
            return null;
        }
    }
    
    private forzarLogout(): void {
        this.logout();
        this.router.navigate(['/login'], { queryParams: { revoked: true } });
    }

    // ... (Tu método logout) ...
    
    logout(): void {
        localStorage.removeItem(this.tokenKey);
        // Desconectar SignalR al cerrar sesión
        if (this.hubConnection) {
            this.hubConnection.stop();
        }
    }



  //  register(request: RegisterRequest): Observable<any> {
  //   return this.http.post(`${this.apiUrl}/register`, request);
  // }


  login(request: LoginRequest): Observable<AuthResponse> {
  return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
    tap(response => {
      if (response.token) {
        localStorage.setItem(this.tokenKey, response.token);        
      }
    })
  );
}

refreshToken(): Observable<any> {
    // 💡 La petición es vacía, el Refresh Token viaja en la HttpOnly Cookie
    // Asegúrate de usar { withCredentials: true } para que el navegador envíe la cookie
    return this.http.post<any>(`${this.apiUrl}/refresh`, {}, { withCredentials: true })
      .pipe(
        tap((res: any) => {
          // Si el refresh es exitoso, guarda el nuevo Access Token
          if (res.token) {
            localStorage.setItem(this.tokenKey, res.token);
          }
        }),
        catchError((error: HttpErrorResponse) => {
          // Si el Refresh Falla (ej. Token Revocado o Expirado)
          this.isRefreshing = false;
          this.logout();
          return throwError(() => error);
        })
      );
  }

    reactivarSesion(refreshTokenId: string): Observable<AuthResponse> {
    const requestBody: ReactivarSesionDTO = { refreshTokenId };
    return this.http.post<AuthResponse>(`${this.apiUrl}/reactivar`, requestBody);
  }

  revokeToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token found');

    return this.http.post(`${this.apiUrl}/revoke`, { refreshToken }).pipe(
      tap(() => this.logout())
    );
  }

//   logout(): void {
//   // Es una buena práctica llamar al endpoint de revocación de refresh token aquí
//   // Si no quieres llamarlo, al menos elimina el access token de localStorage:
//   localStorage.removeItem(this.tokenKey);
//   // No necesitas eliminar el refresh token, el navegador lo hará cuando expire
// }

  getToken(): string | null {
    const token = localStorage.getItem(this.tokenKey);
    console.log("🔑 Token recuperado: ", token);
    return token;
  }


  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshKey);
  }

  getUserEmail(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
      return decoded.sub;
    } catch {
      return null;
    }
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
      return decoded.rol;
    } catch {
      return null;
    }
  }

  // isLoggedIn(): boolean {
  //   const token = this.getToken();
  //   if (!token) return false;

  //   try {
  //     const decoded: any = jwtDecode(token);
  //     const exp = decoded.exp * 1000;
  //     console.log("⏳ Token expira en: ", new Date(exp));
  //     return Date.now() < exp;
  //   } catch {
  //     return false;
  //   }
  // }


//   isLoggedIn(): boolean {
//     const token = this.getToken();
//     if (!token) return false;

//     try {
//         const decoded: any = jwtDecode(token);
//         const exp = decoded.exp * 1000;
//         console.log("⏳ Token expira en: ", new Date(exp));
//         if (Date.now() < exp) {
//             return true;
//         } else {
//             // Si el token está expirado, intentar refrescarlo
//             this.refreshToken().subscribe();
//             return false;
//         }
//     } catch {
//         return false;
//     }
// }


  isLoggedIn(): boolean {
  const token = this.getToken();
  if (!token) return false;

  try {
    const decoded: any = jwtDecode(token);
    const exp = decoded.exp * 1000;
    return Date.now() < exp; // true si no expiró
  } catch {
    return false;
  }
}


}
