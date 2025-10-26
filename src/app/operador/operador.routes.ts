import { Routes } from '@angular/router';
import { Clientes } from './clientes/clientes';
import { Facturacion } from './facturacion/facturacion';
import { Presupuestos } from './presupuestos/presupuestos';

export const OPERADOR_ROUTES: Routes = [
  { path: '', redirectTo: 'clientes', pathMatch: 'full' },

  { path: 'clientes', loadComponent: () => import('./clientes/clientes').then(m => m.Clientes) },

  { path: 'facturacion', loadComponent: () => import('./facturacion/facturacion').then(m => m.Facturacion) },

  { path: 'presupuestos', loadComponent: () => import('./presupuestos/presupuestos').then(m => m.Presupuestos) },
];
