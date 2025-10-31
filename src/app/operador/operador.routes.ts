import { Routes } from '@angular/router';
import { OperadorLayoutComponent } from './operador-layout-component/operador-layout-component';

export const OPERADOR_ROUTES: Routes = [
{
  path:'',
  component: OperadorLayoutComponent,
  children:[

    { path: '', redirectTo: 'clientes', pathMatch: 'full' },
    { path: 'clientes', loadComponent: () => import('./clientes/clientes').then(m => m.Clientes) },
    { path: 'facturacion', loadComponent: () => import('./facturacion/facturacion').then(m => m.Facturacion) },
    { path: 'presupuestos', loadComponent: () => import('./presupuestos/presupuestos').then(m => m.Presupuestos) },
    { path: 'pedidos', loadComponent: () => import('./pedidos/pedidos').then(m => m.Pedidos) },
    { path: 'items', loadComponent: () => import('./items/items').then(m => m.Items) },
  ]
}
];
