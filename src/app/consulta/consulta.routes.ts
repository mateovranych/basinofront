import { Routes } from '@angular/router';


export const CONSULTA_ROUTES: Routes = [
  { path: '', redirectTo: 'comprobantes', pathMatch: 'full' },

  { path: 'comprobantes', loadComponent: () => import('./comprobantes/comprobantes').then(m => m.Comprobantes) },

  { path: 'reportes', loadComponent: () => import('./reportes/reportes').then(m => m.Reportes) },
  
];
