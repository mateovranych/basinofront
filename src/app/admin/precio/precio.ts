import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { debounceTime } from 'rxjs/operators';

import { ItemsService } from '../../services/items-service';
import { PreciosService } from '../../services/precio-service';

import { Item } from '../../interfaces/Item';
import { ItemConPrecios } from '../../interfaces/ItemConPrecios';
import { PrecioConListaDTO } from '../../interfaces/PrecioConListaDTO';

@Component({
  selector: 'app-precio',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatSortModule
  ],
  templateUrl: './precio.html',
  styleUrl: './precio.scss'
})
export class Precio implements OnInit {

  filtroCtrl = new FormControl('');
  dataSource = new MatTableDataSource<ItemConPrecios>([]);
  items: (ItemConPrecios & { _editando?: number | null })[] = [];

  columnasPrecio = [
    { nombre: 'venta', titulo: 'Venta', lista: 2 },
    { nombre: 'costo', titulo: 'Costo', lista: 1 },
    { nombre: 'listaA', titulo: 'Lista A', lista: 3 },
    { nombre: 'listaB', titulo: 'Lista B', lista: 4 },
    { nombre: 'listaC', titulo: 'Lista C', lista: 5 }
  ];

  displayed = ['codigo', 'descripcion', ...this.columnasPrecio.map(c => c.nombre)];
  cargando = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private itemsService: ItemsService,
    private preciosService: PreciosService,
    private snack: MatSnackBar
  ) { }

  ngOnInit() {
    this.cargarTodo();
    this.configurarFiltro();
  }

  configurarFiltro() {
    this.filtroCtrl.valueChanges
      .pipe(debounceTime(250))
      .subscribe(txt => this.aplicarFiltro(txt || ''));
  }

  cargarTodo() {
    this.itemsService.obtenerItems().subscribe({
      next: (items: Item[]) => {
        let pendientes = items.length;

        if (pendientes === 0) {
          this.dataSource.data = [];
          this.cargando = false;
          return;
        }

        items.forEach(i => {
          this.preciosService.obtenerPreciosDeItem(i.id).subscribe(precios => {
            this.items.push({
              ...i,
              precios,
              _editando: null
            });

            pendientes--;
            if (pendientes === 0) {
              this.dataSource.data = this.items;
              this.dataSource.paginator = this.paginator;
              this.dataSource.sort = this.sort;
              this.cargando = false;
            }
          });
        });
      }
    });
  }

  getValor(lista: PrecioConListaDTO[], id: number) {
    return lista.find(p => p.listaPrecioId === id)!;
  }

  onInput(row: any, listaId: number, valor: number) {
    this.getValor(row.precios, listaId).valor = valor;
    row._editando = listaId;
  }

  manejarTeclas(event: KeyboardEvent, row: any, listaId: number) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.guardarPrecio(row, listaId);
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      row._editando = null;
      this.dataSource.data = [...this.dataSource.data];
    }
  }

  guardarPrecio(row: any, listaId: number) {
    const precio = this.getValor(row.precios, listaId);

    this.preciosService.actualizarPrecio(precio.precioId, precio.valor)
      .subscribe({
        next: () => {
          this.snack.open('Precio actualizado', 'OK', { duration: 900 });
          
          if (listaId === 2) {
            this.preciosService.obtenerPreciosDeItem(row.id).subscribe(nuevosPrecios => {
              row.precios = nuevosPrecios;              
              this.dataSource.data = [...this.dataSource.data];
            });
          }

          row._editando = null;
        },

        error: () => this.snack.open('Error al actualizar', 'Cerrar')
      });
  }


  aplicarFiltro(valor: string) {
    const txt = valor.toLowerCase();

    this.dataSource.data = this.items.filter(i =>
      i.codigo.toLowerCase().includes(txt) ||
      i.descripcion.toLowerCase().includes(txt)
    );

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}


// import { CommonModule } from '@angular/common';
// import { Component, OnInit, ViewChild } from '@angular/core';
// import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
// import { MatSnackBar } from '@angular/material/snack-bar';

// import { MatTableModule, MatTableDataSource } from '@angular/material/table';
// import { MatInputModule } from '@angular/material/input';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatIconModule } from '@angular/material/icon';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
// import { MatSort, MatSortModule } from '@angular/material/sort';

// import { debounceTime } from 'rxjs/operators';

// import { ItemsService } from '../../services/items-service';
// import { PreciosService } from '../../services/precio-service';

// import { Item } from '../../interfaces/Item';
// import { ItemConPrecios } from '../../interfaces/ItemConPrecios';
// import { PrecioConListaDTO } from '../../interfaces/PrecioConListaDTO';

// @Component({
//   selector: 'app-precio',
//   standalone: true,
//   imports: [
//     CommonModule,
//     FormsModule,
//     ReactiveFormsModule,
//     MatTableModule,
//     MatInputModule,
//     MatFormFieldModule,
//     MatIconModule,
//     MatProgressSpinnerModule,
//     MatPaginatorModule,
//     MatSortModule
//   ],
//   templateUrl: './precio.html',
//   styleUrl: './precio.scss'
// })
// export class Precio implements OnInit {

//   items: ItemConPrecios[] = [];
//   dataSource = new MatTableDataSource<ItemConPrecios>([]);
//   filtroCtrl = new FormControl('');

//   columnasPrecio = [
//     { nombre: 'venta',  titulo: 'Venta',   lista: 2 },
//     { nombre: 'costo',  titulo: 'Costo',   lista: 1 },
//     { nombre: 'listaA', titulo: 'Lista A', lista: 3 },
//     { nombre: 'listaB', titulo: 'Lista B', lista: 4 },
//     { nombre: 'listaC', titulo: 'Lista C', lista: 5 }
//   ];

//   displayed = ['codigo', 'descripcion', ...this.columnasPrecio.map(c => c.nombre)];

//   cargando = true;

//   @ViewChild(MatPaginator) paginator!: MatPaginator;
//   @ViewChild(MatSort) sort!: MatSort;

//   constructor(
//     private itemsService: ItemsService,
//     private preciosService: PreciosService,
//     private snack: MatSnackBar
//   ) { }

//   ngOnInit(): void {
//     this.cargarTodo();
//     this.configurarFiltro();
//   }

//   configurarFiltro() {
//     this.filtroCtrl.valueChanges
//       .pipe(debounceTime(300))
//       .subscribe(valor => this.aplicarFiltro(valor || ''));
//   }

//   cargarTodo() {
//     this.itemsService.obtenerItems().subscribe({
//       next: (items: Item[]) => {
//         let pendientes = items.length;

//         if (pendientes === 0) {
//           this.dataSource.data = [];
//           this.cargando = false;
//           return;
//         }

//         items.forEach(i => {
//           this.preciosService.obtenerPreciosDeItem(i.id).subscribe(precios => {

//             const item: ItemConPrecios & { _editando?: number | null } = {
//               ...i,
//               precios,
//               _editando: null
//             };

//             this.items.push(item);

//             pendientes--;
//             if (pendientes === 0) {
//               this.dataSource.data = this.items;
//               this.dataSource.paginator = this.paginator;
//               this.dataSource.sort = this.sort;
//               this.cargando = false;
//             }
//           });
//         });
//       }
//     });
//   }

//   getValor(precios: PrecioConListaDTO[], listaId: number) {
//     return precios.find(p => p.listaPrecioId === listaId)!;
//   }

//   onInput(row: any, listaId: number, nuevoValor: number) {
//     const precio = this.getValor(row.precios, listaId);
//     precio.valor = nuevoValor;
//     row._editando = listaId;
//   }

//   manejarTeclas(event: KeyboardEvent, row: any, listaId: number) {
//     if (event.key === 'Enter') {
//       event.preventDefault();
//       this.guardarPrecio(row, listaId);
//     }
//     if (event.key === 'Escape') {
//       event.preventDefault();
//       row._editando = null;
//       // fuerza refresco visual
//       this.dataSource.data = [...this.dataSource.data];
//     }
//   }

//   guardarPrecio(row: any, listaId: number) {
//     const precio = this.getValor(row.precios, listaId);

//     this.preciosService.actualizarPrecio(precio.precioId, precio.valor)
//       .subscribe({
//         next: () => {
//           this.snack.open('Precio actualizado', 'OK', { duration: 1000 });
//           setTimeout(() => row._editando = null, 400);
//         },
//         error: () => {
//           this.snack.open('Error al actualizar precio', 'Cerrar');
//         }
//       });
//   }

//   aplicarFiltro(valor: string) {
//     const txt = valor.toLowerCase();

//     this.dataSource.data = this.items.filter(i =>
//       i.codigo.toLowerCase().includes(txt) ||
//       i.descripcion.toLowerCase().includes(txt)
//     );

//     // mantener paginador/sort funcionando
//     this.dataSource.paginator = this.paginator;
//     this.dataSource.sort = this.sort;
//   }
// }

