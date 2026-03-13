import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';



import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { Facturaciondialog } from './facturaciondialog/facturaciondialog';
import { PdfViewerDialog } from '../../dialogs/pdf-viewer-dialog/pdf-viewer-dialog';
import { Factura } from '../../interfaces/Factura/Factura';
import { FacturaService } from '../../services/factura-service';

@Component({
  selector: 'app-facturacion',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatInputModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './facturacion.html',
  styleUrl: './facturacion.scss'
})
export class Facturacion implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'id', 'cliente', 'tipo', 'numeroComprobante',
    'fecha', 'total', 'cae', 'estado', 'acciones'
  ];

  dataSource = new MatTableDataSource<Factura>([]);
  cargando = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private service: FacturaService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.cargarFacturas();
    this.configurarFiltro();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  cargarFacturas(): void {
    this.cargando = true;
    this.service.obtenerFacturas().subscribe({
      next: (res) => {
        this.dataSource.data = res;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        Swal.fire('Error', 'No se pudieron cargar las facturas', 'error');
      }
    });
  }

  aplicarFiltro(event: Event): void {
    const valor = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = valor;
  }

  configurarFiltro(): void {
    this.dataSource.filterPredicate = (data: Factura, filtro: string): boolean => {
      const texto = filtro.toLowerCase();
      return (
        data.id?.toString().includes(texto) ||
        data.clienteNombre?.toLowerCase().includes(texto) ||
        data.tipoComprobanteNombre?.toLowerCase().includes(texto) ||
        data.numeroComprobante?.toString().includes(texto) ||
        new Date(data.fechaEmision).toLocaleDateString('es-AR').includes(texto) ||
        data.total?.toString().includes(texto) ||
        (data.cae ?? '').includes(texto)
      );
    };
  }

  abrirDialogNuevo(): void {
    const dialogRef = this.dialog.open(Facturaciondialog, {
      width: '95vw',
      maxWidth: '95vw',
      data: { modo: 'crear' }
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado === 'guardado') {
        this.cargarFacturas();
      }
    });
  }

  reintentarAutorizacion(id: number): void {
    Swal.fire({
      title: '¿Reintentar autorización?',
      text: 'Se intentará autorizar la factura en ARCA nuevamente.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, reintentar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.cargando = true;
        this.service.reintentarAutorizacion(id).subscribe({
          next: (factura) => {
            this.cargando = false;
            if (factura.autorizadaEnARCA) {
              Swal.fire('Autorizada', `CAE: ${factura.cae}`, 'success');
            } else {
              Swal.fire('Sin autorizar', factura.arcaMensajeError || 'ARCA no autorizó', 'warning');
            }
            this.cargarFacturas();
          },
          error: () => {
            this.cargando = false;
            Swal.fire('Error', 'No se pudo reintentar la autorización', 'error');
          }
        });
      }
    });
  }

  eliminarFactura(id: number): void {
    this.service.validarEliminar(id).subscribe({
      next: (validacion) => {
        if (!validacion.puedeEliminar) {
          Swal.fire('No permitido', validacion.mensaje || 'No se puede eliminar', 'warning');
          return;
        }

        Swal.fire({
          title: '¿Eliminar factura?',
          text: validacion.mensaje || 'Esta acción no se puede deshacer.',
          icon: validacion.tieneMovimientos ? 'warning' : 'question',
          showCancelButton: true,
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar'
        }).then(result => {
          if (result.isConfirmed) {
            this.service.eliminarFactura(id).subscribe({
              next: () => {
                Swal.fire('Eliminada', 'Factura eliminada correctamente', 'success');
                this.cargarFacturas();
              },
              error: (err) => {
                const mensaje = err.error?.message || 'Ocurrió un error inesperado';
                Swal.fire('Error', mensaje, 'error');
              }
            });
          }
        });
      },
      error: () => Swal.fire('Error', 'No se pudo validar la factura', 'error')
    });
  }

  verFactura(id: number): void {
    this.service.descargarPdf(id).subscribe(pdfBlob => {
      const url = URL.createObjectURL(pdfBlob);
      const dialogRef = this.dialog.open(PdfViewerDialog, {
        width: '95vw',
        maxWidth: '95vw',
        height: '90vh',
        data: { url, filename: `factura_${id}.pdf` }
      });
      dialogRef.afterClosed().subscribe(() => URL.revokeObjectURL(url));
    });
  }

  descargarFactura(id: number): void {
    this.service.descargarPdf(id).subscribe(pdf => {
      const url = window.URL.createObjectURL(pdf);
      const a = document.createElement('a');
      a.href = url;
      a.download = `factura_${id}.pdf`;
      a.click();
    });
  }
}
