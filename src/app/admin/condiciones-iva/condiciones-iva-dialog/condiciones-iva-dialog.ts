import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CondicionesIvaService } from '../../../services/condiciones-iva-service';
import { CondicionIva } from '../../../interfaces/CondicionIva';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-condiciones-iva-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './condiciones-iva-dialog.html',
  styleUrl: './condiciones-iva-dialog.scss'
})
export class CondicionesIvaDialog {
   titulo = '';
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CondicionesIvaDialog>,
    private condicionesService: CondicionesIvaService,
    @Inject(MAT_DIALOG_DATA) public data: CondicionIva | null
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      codigoAfip: ['', [Validators.required, Validators.pattern(/^[0-9]{1,3}$/)]],
    });

    if (this.data) {
      this.form.patchValue(this.data);
      this.titulo = 'Editar Condición IVA';
    } else {
      this.titulo = 'Nueva Condición IVA';
    }
  }

  guardar() {
    if (this.form.invalid) return;

    const payload = this.form.value;

    if (this.data) payload.id = this.data.id;

    const request$ = this.data
      ? this.condicionesService.update(payload.id, payload)
      : this.condicionesService.create(payload);

    request$.subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: this.data ? 'Actualizado' : 'Creado',
          timer: 1200,
          showConfirmButton: false,
        });
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'No se pudo guardar la condición.', 'error');
      },
    });
  }

  cancelar() {
    this.dialogRef.close(false);
  }

}
