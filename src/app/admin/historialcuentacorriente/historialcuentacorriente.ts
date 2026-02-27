import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

import { Cuentacorrienteservice } from '../../services/cuentacorrienteservice';
import { ClientesService } from '../../services/clientes-service';
import { MovimientoCuentaCorriente } from '../../interfaces/CuentaCorriente/MovimientoCuentaCorriente';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { PdfViewerDialog } from '../../dialogs/pdf-viewer-dialog/pdf-viewer-dialog';

@Component({
  selector: 'app-historialcuentacorriente',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    NgxMatSelectSearchModule,
    MatTableModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './historialcuentacorriente.html',
  styleUrl: './historialcuentacorriente.scss'
})
export class Historialcuentacorriente implements OnInit {
  clientes: any[] = [];
  clientesFiltrados: any[] = [];
  clienteIdCtrl = new FormControl<number | null>(null);
  filtroClientesCtrl = new FormControl('');

  fechaDesde = new FormControl<Date | null>(null);
  fechaHasta = new FormControl<Date | null>(null);

  columnas: string[] = ['fecha', 'concepto', 'debe', 'haber', 'saldo'];

  dataSource = new MatTableDataSource<MovimientoCuentaCorriente>([]);

  movimientos: MovimientoCuentaCorriente[] = [];
  cargando = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private cuentaCorrienteService: Cuentacorrienteservice,
    private clientesService: ClientesService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.cargarClientes();

    this.filtroClientesCtrl.valueChanges.subscribe(valor => {
      const filtro = (valor || '').toLowerCase();
      this.clientesFiltrados = this.clientes.filter(c =>
        c.razonSocial.toLowerCase().includes(filtro)
      );
    });

    this.clienteIdCtrl.valueChanges.subscribe(id => {
      if (id) {
        this.cargarHistorial(id);
      } else {
        this.movimientos = [];
      }
    });

    this.fechaDesde.valueChanges.subscribe(() => this.aplicarFiltroFechas());
    this.fechaHasta.valueChanges.subscribe(() => this.aplicarFiltroFechas());
  }

  cargarClientes(): void {
    this.clientesService.getAll().subscribe(res => {
      this.clientes = res;
      this.clientesFiltrados = res;
    });
  }

  cargarHistorial(clienteId: number): void {
    this.cargando = true;
    this.cuentaCorrienteService.obtenerHistorial(clienteId).subscribe({
      next: res => {
        this.dataSource.data = res;

        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
        });

      },
      error: () => {
        this.cargando = false;
        this.dataSource.data = [];
      },
      complete: () => this.cargando = false
    });
  }

  aplicarFiltroFechas() {
    const desdeRaw = this.fechaDesde.value;
    const hastaRaw = this.fechaHasta.value;

    const desde = desdeRaw
      ? new Date(desdeRaw.getFullYear(), desdeRaw.getMonth(), desdeRaw.getDate(), 0, 0, 0, 0)
      : null;

    const hasta = hastaRaw
      ? new Date(hastaRaw.getFullYear(), hastaRaw.getMonth(), hastaRaw.getDate(), 23, 59, 59, 999)
      : null;

    this.dataSource.filterPredicate = (data: MovimientoCuentaCorriente) => {
      const fechaMov = new Date(data.fecha);
      const t = fechaMov.getTime();

      if (desde && t < desde.getTime()) return false;
      if (hasta && t > hasta.getTime()) return false;
      return true;
    };

    this.dataSource.filter = String(Date.now());

    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();

  }


  exportarPDF(): void {
    const clienteId = this.clienteIdCtrl.value;
    if (!clienteId) return;

    const dto = {
      clienteId,
      desde: this.fechaDesde.value
        ? this.formatDateOnly(this.fechaDesde.value)
        : null,
      hasta: this.fechaHasta.value
        ? this.formatDateOnly(this.fechaHasta.value)
        : null
    };

    this.cargando = true;

    this.cuentaCorrienteService.imprimirHistorial(dto).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'CC_historial.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error(err),
      complete: () => this.cargando = false
    });
  }
  private formatDateOnly(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  verHistorial(): void {

    const clienteId = this.clienteIdCtrl.value;
    if (!clienteId) return;

    const dto = {
      clienteId,
      desde: this.fechaDesde.value
        ? this.formatDateOnly(this.fechaDesde.value)
        : null,
      hasta: this.fechaHasta.value
        ? this.formatDateOnly(this.fechaHasta.value)
        : null
    };

    this.cargando = true;

    this.cuentaCorrienteService.imprimirHistorial(dto).subscribe({
      next: (blob) => {

        const url = URL.createObjectURL(blob);

        this.dialog.open(PdfViewerDialog, {
          width: '95vw',
          height: '90vh',
          maxWidth: '95vw',
          data: {
            url,
            filename: 'CuentaCorriente.pdf',
            onExportExcel: () => this.exportarExcel(dto)
          }
        });

      },
      complete: () => this.cargando = false
    });
  }

  exportarExcel(dto: any): void {

  this.cargando = true;

  this.cuentaCorrienteService.exportarExcel(dto).subscribe({
    next: (blob) => {

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'CuentaCorriente.xlsx';
      a.click();

      URL.revokeObjectURL(url);
    },
    error: (err) => {
      console.error(err);
    },
    complete: () => {
      this.cargando = false;
    }
  });
}

}