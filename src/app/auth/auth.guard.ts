import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from '../services/auth-service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const token = this.authService.getToken();

    // Si no hay token, redirige al login
    if (!token) {
      console.warn('🚫 No hay token. Redirigiendo a login.');
      return this.router.parseUrl('/login');
    }

    try {      
      // Decodificamos el token
      const decoded: any = jwtDecode(token);
      
      // Imprimimos el token completo decodificado
      console.log('🔓 Token decodificado:', decoded);

      const userRole = decoded.rol;  // Obtenemos el rol del usuario desde el token
      const allowedRoles = route.data['roles'] as Array<string>;  // Roles permitidos por la ruta

      // Imprimimos el rol del usuario y los roles permitidos en la ruta
      console.log('🔑 Rol del usuario:', userRole);
      console.log('✅ Roles permitidos en la ruta:', allowedRoles);

      // Comprobamos si el rol del usuario es válido para la ruta
      if (allowedRoles.includes(userRole)) {
        console.log('✅ Acceso autorizado');
        return true;
      } else {
        console.warn('⚠️ Rol no autorizado.');
        return this.router.parseUrl('/unauthorized');
      }
    } catch (error) {
      console.error('❌ Error decodificando token:', error);
      return this.router.parseUrl('/login');
    }
  }
}
