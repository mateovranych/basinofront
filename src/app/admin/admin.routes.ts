// admin.routes.ts
import { Routes } from '@angular/router';

import { AdminLayoutComponent } from './admin-layout-component/admin-layout-component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', loadComponent: () => import('../operador/clientes/clientes').then(m => m.Clientes) },
      { path: 'condiciones-iva', loadComponent: () => import('./condiciones-iva/condiciones-iva').then(m => m.CondicionesIva) },
      // { path: 'sesiones', loadComponent: () => import('./sesiones/sesiones').then(m => m.Sesiones) },
      { path: 'categorias', loadComponent: () => import('./categorias/categorias').then(m => m.Categorias) },
      { path: 'clientes', loadComponent: () => import('../operador/clientes/clientes').then(m => m.Clientes) },
      { path: 'proveedores', loadComponent: () => import('../operador/proveedores/proveedores').then(m => m.Proveedores) },
      { path: 'facturacion', loadComponent: () => import('../operador/facturacion/facturacion').then(m => m.Facturacion) },
      { path: 'presupuestos', loadComponent: () => import('../operador/presupuestos/presupuestos').then(m => m.Presupuestos) },
      { path: 'pedidos', loadComponent: () => import('../operador/pedidos/pedidos').then(m => m.Pedidos) },
      { path: 'precio', loadComponent: () => import('../admin/precio/precio').then(m => m.Precio) },
      { path: 'items', loadComponent: () => import('../operador/items/items').then(m => m.Items) },
      { path: 'comprobantes', loadComponent: () => import('../consulta/comprobantes/comprobantes').then(m => m.Comprobantes) },
      { path: 'reportes', loadComponent: () => import('../consulta/reportes/reportes').then(m => m.Reportes) },
      { path: 'presentacion', loadComponent: () => import('../admin/presentacion/presentacion').then(m => m.Presentacion) },
      { path: 'provincias', loadComponent: () => import('../admin/provincias/provincias').then(m => m.Provincias) },
      { path: 'localidades', loadComponent: () => import('../admin/localidades/localidades').then(m => m.Localidades) },
    ],
  },
];
