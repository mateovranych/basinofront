import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Cuentacorrienteservice } from '../../services/cuentacorrienteservice';
import { MatDialog } from '@angular/material/dialog';
import { PdfViewerDialog } from '../../dialogs/pdf-viewer-dialog/pdf-viewer-dialog';

@Component({
  selector: 'app-saldogeneral',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatButtonModule,
    MatIconModule, MatInputModule, MatFormFieldModule, MatProgressSpinnerModule],
  templateUrl: './saldogeneral.html',
  styleUrl: './saldogeneral.scss',
})
export class Saldogeneral implements OnInit {

  columnas: string[] = ['cliente', 'saldo'];
  dataSource = new MatTableDataSource<any>([]);
  cargando = false;
  fechaHoy = new Date();
  totalGeneral = 0;
  exportandoExcel = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(

    private ccService: Cuentacorrienteservice,
    private dialog: MatDialog




  ) { }

  ngOnInit() {
    this.cargarSaldos();
  }


  cargarSaldos(): void {
    this.cargando = true;
    this.ccService.getSaldosGenerales().subscribe({
      next: (res) => {
        this.dataSource.data = res;
        this.dataSource.paginator = this.paginator;
        this.calcularTotal();
      },
      error: () => this.cargando = false,
      complete: () => this.cargando = false
    });
  }

  calcularTotal(): void {
    this.totalGeneral = this.dataSource.data.reduce((acc, item) => acc + item.saldo, 0);
  }

  aplicarFiltro(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  verReporte() {

    this.cargando = true;

    this.ccService.exportarSaldoGeneralPDF().subscribe({
      next: (blob) => {

        const url = URL.createObjectURL(blob);

        const dialogRef = this.dialog.open(PdfViewerDialog, {
          width: '95vw',
          height: '90vh',
          maxWidth: '95vw',
          data: {
            url,
            filename: 'SaldoGeneral.pdf',
            onExportExcel: () => this.exportarExcel()
          }
        });

        dialogRef.afterClosed().subscribe(() => {
          URL.revokeObjectURL(url);
        });

      },
      error: (err) => console.error(err),
      complete: () => this.cargando = false
    });
  }

  exportarExcel() {

    this.exportandoExcel = true;

    this.ccService.exportarSaldoGeneralExcel().subscribe({
      next: (blob) => {

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'SaldoGeneral.xlsx';
        a.click();

        URL.revokeObjectURL(url);
      },
      error: (err) => console.error(err),
      complete: () => this.exportandoExcel = false
    });
  }


}

