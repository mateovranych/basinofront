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


  terminoBusqueda: string = '';
  filtroMinVenta: number | null = null;
  filtroMaxVenta: number | null = null;


  ordenColumna: string = 'codigo';
  ordenAsc: boolean = true;

  pageSize = 50;
  pageIndex = 0;
  totalPaginas = 1;


  porcentajeGlobal: number | null = null;


  listas = [
    { nombre: 'LISTA A', key: 'listaA' },
    { nombre: 'LISTA B', key: 'listaB' },
    { nombre: 'LISTA C', key: 'listaC' },
  ];



  listaExportar: 'listaA' | 'listaB' | 'listaC' = 'listaA';

  private valorAnterior = new WeakMap<any, Record<string, number>>();


  displayedColumns: string[] = [];

  constructor(
    private itemsService: ItemsService,
    private precioConfigService: PrecioConfiguracionesService,
    private precioService: PreciosService
  ) { }

  ngOnInit(): void {
    this.cargarItems();
  }


  moverFocoAbajo(event: Event, filaIndex: number, selectorColumna: string) {
    event.preventDefault();

    setTimeout(() => {

      const filas = Array.from(document.querySelectorAll('.mat-mdc-row'));


      const filaSiguiente = filas[filaIndex + 1];

      if (filaSiguiente) {

        const nextInput = filaSiguiente.querySelector(selectorColumna) as HTMLInputElement;

        if (nextInput) {
          nextInput.focus();
          // nextInput.select();
        }
      } else {

        if (this.pageIndex + 1 < this.totalPaginas) {
          this.paginaSiguiente();

        }
      }
    }, 10);
  }






  cargarItems() {
    this.itemsService.obtenerItemsConPrecios().subscribe({
      next: data => {

        this.itemsOriginal = data.map(x => this.transformarItem(x));

        this.aplicarOrdenamientoLogica();

        this.aplicarFiltros();

        this.displayedColumns = [
          'codigo',
          'descripcion',
          'precioVenta',
          // 'precioCosto',
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
    this.actualizarPagina();
  }



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


  ordenar(col: string) {
    if (this.ordenColumna === col) {
      this.ordenAsc = !this.ordenAsc;
    } else {
      this.ordenColumna = col;
      this.ordenAsc = true;
    }

    this.aplicarOrdenamientoLogica();
    this.aplicarFiltros();
  }



  //LE SACO EL MATH.ROUND PARA NO READONDEAR.
  onPorcentajeChange(item: any, lista: any) {
    const nuevo = lista.porcentaje;



    const nuevoPrecio = (item.precioVenta * (1 + nuevo / 100));
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

  onPrecioVentaChange(item: any) {
    const venta = item.precios.find((p: any) => p.listaNombre === 'VENTA');
    if (!venta) return;

    item._highlight = true;
    setTimeout(() => item._highlight = false, 400);

    this.precioService
      .actualizarPrecio(venta.precioId, item.precioVenta)
      .subscribe(() => {
        // ESTO ESTABA ROMPIENDO EL FOCO:
        // this.cargarItems(); 
        console.log('Precio actualizado en servidor');
      });
  }



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


      //LE SACO EL MATH.ROUHD PARA NO REDONDEAR
      for (const lista of item.listasDetalle) {
        lista.porcentaje = this.porcentajeGlobal!;
        const nuevoPrecio = (item.precioVenta * (1 + lista.porcentaje / 100));
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
    this.itemsService.obtenerItemsParaExportar().subscribe({
      next: items => {

        const headers = [
          'Codigo',
          'Descripcion',
          'Precio Venta',
          'Precio Costo',
          'Lista A',
          'Lista B',
          'Lista C'
        ];

        const rows = items.map(i => [
          i.codigo,
          i.descripcion,
          i.precioVenta,
          i.precioCosto,
          i.precioListaA,
          i.precioListaB,
          i.precioListaC
        ]);

        this.descargarCSV(headers, rows, 'precios.csv');
      },
      error: () => {
        Swal.fire('Error', 'No se pudo exportar la lista de precios', 'error');
      }
    });
  }


  exportarListaSeleccionada() {
    this.itemsService.obtenerItemsParaExportar().subscribe({
      next: items => {

        const headers = ['Descripcion', 'Precio'];

        const rows = items.map(i => {
          let precio = 0;

          switch (this.listaExportar) {
            case 'listaA': precio = i.precioListaA; break;
            case 'listaB': precio = i.precioListaB; break;
            case 'listaC': precio = i.precioListaC; break;
          }

          return [i.descripcion, precio];
        });

        this.descargarCSV(
          headers,
          rows,
          `precios_${this.listaExportar}.csv`
        );
      },
      error: () => {
        Swal.fire('Error', 'No se pudo exportar la lista', 'error');
      }
    });
  }

  private descargarCSV(headers: string[], rows: any[], nombre: string) {
    const csv =
      headers.join(';') + '\n' +
      rows.map(r => r.join(';')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = nombre;
    a.click();

    URL.revokeObjectURL(url);
  }

  private aplicarOrdenamientoLogica() {
    const col = this.ordenColumna;
    if (!col) return;

    this.itemsOriginal.sort((a: any, b: any) => {
      const valA = a[col] ?? '';
      const valB = b[col] ?? '';

      const comparison = String(valA).localeCompare(String(valB), undefined, {
        numeric: true,
        sensitivity: 'base'
      });

      return this.ordenAsc ? comparison : -comparison;
    });
  }

  onEnterPrecioVenta(event: Event, item: any, filaIndex: number) {
    const keyboardEvent = event as KeyboardEvent;
    keyboardEvent.preventDefault();

    for (const lista of item.listasDetalle) {
      //LE SACO EL MATH.ROUHD PARA NO REDONDEAR
      lista.precio = (
        item.precioVenta * (1 + lista.porcentaje / 100)
      );
    }

    this.onPrecioVentaChange(item);

    this.moverFocoAbajo(keyboardEvent, filaIndex, '.input-precio-venta');
  }


  onEnterPorcentaje(
    event: Event,
    item: any,
    lista: any,
    filaIndex: number,
    listaKey: string
  ) {
    const keyboardEvent = event as KeyboardEvent;
    keyboardEvent.preventDefault();

    //LE SACO EL MATH.ROUHD PARA NO REDONDEAR

    lista.precio = (
      item.precioVenta * (1 + lista.porcentaje / 100)
    );

    this.onPorcentajeChange(item, lista);

    this.moverFocoAbajo(
      keyboardEvent,
      filaIndex,
      '.input-pct-' + listaKey
    );
  }

  //LE SACO EL MATH.ROUHD PARA NO REDONDEAR
  onPorcentajeInput(item: any, lista: any) {
    lista.precio = (
      item.precioVenta * (1 + lista.porcentaje / 100)
    );
  }
  //LE SACO EL MATH.ROUHD PARA NO REDONDEAR
  onPrecioVentaInput(item: any) {
    for (const lista of item.listasDetalle) {
      lista.precio = (
        item.precioVenta * (1 + lista.porcentaje / 100)
      );
    }
  }

  onTabPrecioVenta(event: Event, item: any) {

    this.onPrecioVentaInput(item);
    this.onPrecioVentaChange(item);
  }


  onTabPorcentaje(event: Event, item: any, lista: any) {
    this.onPorcentajeInput(item, lista);
    this.onPorcentajeChange(item, lista);
  }

  onKeyDownNumero(event: KeyboardEvent) {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
    }
  }


  onFocusNumero(obj: any, campo: string) {
    if (!this.valorAnterior.has(obj)) {
      this.valorAnterior.set(obj, {});
    }

    this.valorAnterior.get(obj)![campo] = obj[campo];
  }

  onEscapeNumero(obj: any, campo: string) {
    const original = this.valorAnterior.get(obj)?.[campo];

    if (original !== undefined) {
      obj[campo] = original;
    }
  }



}
