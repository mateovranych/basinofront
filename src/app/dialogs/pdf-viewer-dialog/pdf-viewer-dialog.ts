import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-pdf-viewer-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './pdf-viewer-dialog.html',
  styleUrl: './pdf-viewer-dialog.scss',
})
export class PdfViewerDialog {

  safeUrl: SafeResourceUrl;
  exportando = false;

  constructor(
    private dialogRef: MatDialogRef<PdfViewerDialog>,
    private sanitizer: DomSanitizer,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      url: string;
      filename: string;
      onExportExcel?: () => void;
    }
  ) {
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(data.url);
  }

  descargar(): void {
    const a = document.createElement('a');
    a.href = this.data.url;
    a.download = this.data.filename;
    a.click();
  }

  exportarExcel(): void {

    if (!this.data.onExportExcel) return;

    this.exportando = true;

    Promise.resolve(this.data.onExportExcel())
      .finally(() => {
        this.exportando = false;
      });
  }

  cerrar(): void {
    this.dialogRef.close();
  }

}
