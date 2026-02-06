import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RecibosService } from '../../../services/recibos-service';

@Component({
  selector: 'app-recibopdf',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './recibopdf.html',
  styleUrl: './recibopdf.scss',
})
export class Recibopdf implements OnInit {

  pdfUrl: SafeResourceUrl | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { reciboId: number },
    private recibosService: RecibosService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.recibosService.obtenerPdf(this.data.reciboId)
      .subscribe(blob => {
        const url = URL.createObjectURL(blob);
        this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      });
  }
}
