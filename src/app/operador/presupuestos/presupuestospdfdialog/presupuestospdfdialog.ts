import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-presupuestospdfdialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './presupuestospdfdialog.html',
  styleUrl: './presupuestospdfdialog.scss'
})
export class Presupuestospdfdialog {

  safeUrl: SafeResourceUrl;

  constructor(
    private dialogRef: MatDialogRef<Presupuestospdfdialog>,
    private sanitizer: DomSanitizer,
    @Inject(MAT_DIALOG_DATA)
    public data: { url: string; filename: string }
  ) {
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(data.url);
  }

  descargar(): void {
    const a = document.createElement('a');
    a.href = this.data.url;
    a.download = this.data.filename;
    a.click();
  }

  abrirEnPestania(): void {
    window.open(this.data.url, '_blank', 'noopener');
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
