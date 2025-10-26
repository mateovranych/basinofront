// admin.routes.ts
import { Routes } from '@angular/router';

import { AdminLayoutComponent } from './admin-layout-component/admin-layout-component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', loadComponent: () => import('./admin-dashboard-component/admin-dashboard-component').then(m => m.AdminDashboardComponent) },
      { path: 'condiciones-iva', loadComponent: () => import('./condiciones-iva/condiciones-iva').then(m => m.CondicionesIva) },
      { path: 'sesiones', loadComponent: () => import('./sesiones/sesiones').then(m => m.Sesiones) },
      { path: 'clientes', loadComponent: () => import('../operador/clientes/clientes').then(m => m.Clientes) },
      { path: 'facturacion', loadComponent: () => import('../operador/facturacion/facturacion').then(m => m.Facturacion) },
      { path: 'presupuestos', loadComponent: () => import('../operador/presupuestos/presupuestos').then(m => m.Presupuestos) },
      { path: 'comprobantes', loadComponent: () => import('../consulta/comprobantes/comprobantes').then(m => m.Comprobantes) },
      { path: 'reportes', loadComponent: () => import('../consulta/reportes/reportes').then(m => m.Reportes) },
    ],
  },
];
