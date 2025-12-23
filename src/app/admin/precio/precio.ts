import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';

import { ItemsService } from '../../services/items-service';
import { PrecioConfiguracionesService } from '../../services/precio-configuraciones-service';
import { PreciosService } from '../../services/precio-service';
import { ItemConPrecios } from '../../interfaces/Items/ItemConPrecios';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-precio',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatInputModule,
    MatButtonModule,
    MatOptionModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  templateUrl: './precio.html',
  styleUrls: ['./precio.scss']
})
export class Precio implements OnInit {

  itemsOriginal: any[] = [];
  itemsFiltrados: any[] = [];
  itemsPagina: any[] = [];

  // Buscador y filtros
  terminoBusqueda: string = '';
  filtroMinVenta: number | null = null;
  filtroMaxVenta: number | null = null;

  // Ordenamiento
  ordenColumna: string = '';
  ordenAsc: boolean = true;

  // Paginación
  pageSize = 10;
  pageIndex = 0;
  totalPaginas = 1;

  // Porcentaje global
  porcentajeGlobal: number | null = null;

  // Config de listas
  listas = [
    { nombre: 'LISTA A', key: 'listaA' },
    { nombre: 'LISTA B', key: 'listaB' },
    { nombre: 'LISTA C', key: 'listaC' },
  ];

  // listaExportar: 'LISTA A' | 'LISTA B' | 'LISTA C' = 'LISTA A';

  listaExportar: 'listaA' | 'listaB' | 'listaC' = 'listaA';


  displayedColumns: string[] = [];

  constructor(
    private itemsService: ItemsService,
    private precioConfigService: PrecioConfiguracionesService,
    private precioService: PreciosService
  ) { }

  ngOnInit(): void {
    this.cargarItems();
  }

  // ==========================
  // 🧠 CARGA Y TRANSFORMACIÓN
  // ==========================
  cargarItems() {
    this.itemsService.obtenerItemsConPrecios().subscribe({
      next: data => {
        this.itemsOriginal = data.map(x => this.transformarItem(x));
        // Por defecto aplicamos filtros (vacíos) y paginamos
        this.aplicarFiltros();
        // Definimos las columnas visibles
        this.displayedColumns = [
          'codigo',
          'descripcion',
          'precioVenta',
          'precioCosto',
          ...this.listas.flatMap(l => [l.key + '_pct', l.key + '_val'])
        ];
      }
    });
  }

  transformarItem(item: ItemConPrecios) {
    const precioVenta = item.precios.find(x => x.listaNombre === 'VENTA')?.valor ?? 0;
    const precioCosto = item.precios.find(x => x.listaNombre === 'COSTO')?.valor ?? 0;

    const listasDetalle = this.listas.map(l => {
      const precio = item.precios.find(x => x.listaNombre === l.nombre)?.valor ?? 0;
      const config = item.configs.find(x => x.listaNombre === l.nombre);

      return {
        key: l.key,
        nombre: l.nombre,
        porcentaje: config?.porcentaje ?? 0,
        porcentajeId: config?.id,
        precio
      };
    });

    return {
      ...item,
      precioVenta,
      precioCosto,
      listasDetalle,
      _highlight: false
    };
  }

  // ==========================
  // 🔍 FILTROS Y BUSCADOR
  // ==========================

  aplicarFiltros() {
    const t = this.terminoBusqueda.trim().toLowerCase();

    let lista = [...this.itemsOriginal];

    if (t !== '') {
      lista = lista.filter(item =>
        item.codigo.toLowerCase().includes(t) ||
        item.descripcion.toLowerCase().includes(t)
      );
    }

    if (this.filtroMinVenta !== null && !isNaN(this.filtroMinVenta)) {
      lista = lista.filter(item => item.precioVenta >= this.filtroMinVenta!);
    }

    if (this.filtroMaxVenta !== null && !isNaN(this.filtroMaxVenta)) {
      lista = lista.filter(item => item.precioVenta <= this.filtroMaxVenta!);
    }

    this.itemsFiltrados = lista;

    this.pageIndex = 0;
    this.actualizarPagina();
  }

  // ==========================
  // 📄 PAGINACIÓN
  // ==========================

  actualizarPagina() {
    const total = this.itemsFiltrados.length;
    this.pageSize = Number(this.pageSize) || 10;
    this.totalPaginas = Math.max(1, Math.ceil(total / this.pageSize));

    if (this.pageIndex >= this.totalPaginas) {
      this.pageIndex = this.totalPaginas - 1;
    }
    if (this.pageIndex < 0) this.pageIndex = 0;

    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.itemsPagina = this.itemsFiltrados.slice(start, end);
  }

  paginaAnterior() {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      this.actualizarPagina();
    }
  }

  paginaSiguiente() {
    if (this.pageIndex + 1 < this.totalPaginas) {
      this.pageIndex++;
      this.actualizarPagina();
    }
  }

  cambiarPageSize() {
    this.pageIndex = 0;
    this.actualizarPagina();
  }

  // ==========================
  // ↕️ ORDENAMIENTO
  // ==========================

  ordenar(col: string) {
    if (this.ordenColumna === col) {
      this.ordenAsc = !this.ordenAsc;
    } else {
      this.ordenColumna = col;
      this.ordenAsc = true;
    }

    this.itemsFiltrados.sort((a: any, b: any) => {
      const valA = a[col] ?? '';
      const valB = b[col] ?? '';

      if (typeof valA === 'string' && typeof valB === 'string') {
        return this.ordenAsc
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      const numA = Number(valA);
      const numB = Number(valB);

      if (numA < numB) return this.ordenAsc ? -1 : 1;
      if (numA > numB) return this.ordenAsc ? 1 : -1;
      return 0;
    });

    this.actualizarPagina();
  }


  onPorcentajeChange(item: any, lista: any) {
    const nuevo = lista.porcentaje;

    const nuevoPrecio = Math.round(item.precioVenta * (1 + nuevo / 100));
    lista.precio = nuevoPrecio;

    item._highlight = true;
    setTimeout(() => item._highlight = false, 400);

    if (!lista.porcentajeId) return;

    this.precioConfigService
      .actualizar(lista.porcentajeId, lista.porcentaje)
      .subscribe();
  }



  onPrecioCostoChange(item: any) {
    const costo = item.precios.find((p: any) => p.listaNombre === 'COSTO');
    if (!costo) return;

    item._highlight = true;
    setTimeout(() => item._highlight = false, 400);

    this.precioService
      .actualizarPrecio(costo.precioId, item.precioCosto)
      .subscribe();
  }



  // ==========================
  // 💰 CAMBIO PRECIO VENTA
  // ==========================

  onPrecioVentaChange(item: any) {
    const venta = item.precios.find((p: any) => p.listaNombre === 'VENTA');
    if (!venta) return;

    item._highlight = true;
    setTimeout(() => item._highlight = false, 400);

    this.precioService
      .actualizarPrecio(venta.precioId, item.precioVenta)
      .subscribe(() => {
        this.cargarItems(); // si querés recalcular todo
      });
  }


  // ==========================
  // 💣 BOTÓN GLOBAL: APLICAR % A TODAS LAS LISTAS
  // ==========================

  async aplicarPorcentajeGlobal() {
    if (this.porcentajeGlobal === null || isNaN(this.porcentajeGlobal)) {
      return;
    }

    const result = await Swal.fire({
      title: 'Aplicar porcentaje global',
      html: `
        Vas a aplicar <b>${this.porcentajeGlobal}%</b> a todas las listas
        <b>(LISTA A, B y C)</b> de los ítems filtrados.<br/>
        ¿Estás seguro?
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Aplicar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    const peticiones: any[] = [];

    for (const item of this.itemsFiltrados) {
      item._highlight = true;

      for (const lista of item.listasDetalle) {
        lista.porcentaje = this.porcentajeGlobal!;
        const nuevoPrecio = Math.round(item.precioVenta * (1 + lista.porcentaje / 100));
        lista.precio = nuevoPrecio;

        if (lista.porcentajeId) {
          peticiones.push(
            this.precioConfigService.actualizar(lista.porcentajeId, lista.porcentaje)
          );
        }
      }
    }

    setTimeout(() => {
      this.itemsFiltrados.forEach(i => i._highlight = false);
    }, 800);

    if (peticiones.length === 0) return;

    forkJoin(peticiones).subscribe(() => {
      Swal.fire('Listo', 'Porcentajes actualizados correctamente', 'success');
      this.cargarItems();
    });
  }

  exportarAExcel() {
    const headers = [
      'Codigo',
      'Descripcion',
      'PrecioVenta',
      'PrecioCosto',
      ...this.listas.flatMap(l => [
        `% ${l.nombre}`,
        `Precio ${l.nombre}`
      ])
    ];

    const rows = this.itemsFiltrados.map(item => {
      const fila: (string | number)[] = [
        item.codigo,
        item.descripcion,
        item.precioVenta,
        item.precioCosto
      ];

      for (const l of this.listas) {
        const det = item.listasDetalle.find((d: any) => d.key === l.key);
        fila.push(det?.porcentaje ?? '');
        fila.push(det?.precio ?? '');
      }

      return fila;
    });

    const csvContent =
      headers.join(';') + '\n' +
      rows.map(r => r.join(';')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'precios.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  // exportarListaSeleccionada() {
  //   const lista = this.listas.find(l => l.nombre === this.listaExportar);
  //   if (!lista) return;

  //   const headers = ['Descripcion', 'Precio'];

  //   const rows = this.itemsFiltrados.map(item => {
  //     const detalle = item.listasDetalle.find(
  //       (d: any) => d.key === lista.key
  //     );

  //     return [
  //       item.descripcion,
  //       detalle?.precio ?? 0
  //     ];
  //   });

  //   const csvContent =
  //     headers.join(';') + '\n' +
  //     rows.map(r => r.join(';')).join('\n');

  //   const blob = new Blob([csvContent], {
  //     type: 'text/csv;charset=utf-8;'
  //   });

  //   const url = URL.createObjectURL(blob);
  //   const a = document.createElement('a');
  //   a.href = url;
  //   a.download = `precios_${this.listaExportar.replace(' ', '_')}.csv`;
  //   a.click();
  //   URL.revokeObjectURL(url);
  // }


  exportarListaSeleccionada() {
    const headers = ['Descripcion', 'Precio'];

    const rows = this.itemsFiltrados.map(item => {
      const detalle = item.listasDetalle.find(
        (d: any) => d.key === this.listaExportar
      );

      return [
        item.descripcion,
        detalle?.precio ?? 0
      ];
    });

    const csvContent =
      headers.join(';') + '\n' +
      rows.map(r => r.join(';')).join('\n');

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `precios_${this.listaExportar}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }



}
