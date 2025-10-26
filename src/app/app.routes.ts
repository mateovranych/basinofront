import { Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';


export const routes: Routes = [

  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () => import('./auth/login/login').then(m => m.Login)
  },

  {
    path: 'admin',    
    canActivate: [AuthGuard],
    data: { roles: ['Admin'] },
    loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  {
    path: 'operador',    
    canActivate: [AuthGuard],
    data: { roles: ['Operador', 'Admin'] },
    loadChildren: () => import('./operador/operador.routes').then(m => m.OPERADOR_ROUTES)
  },
  {
    path: 'consulta',    
    canActivate: [AuthGuard],
    data: { roles: ['Consulta', 'Operador', 'Admin'] },
    loadChildren: () => import('./consulta/consulta.routes').then(m => m.CONSULTA_ROUTES)
  }



];
