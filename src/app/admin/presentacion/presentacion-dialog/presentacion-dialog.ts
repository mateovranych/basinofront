import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import Swal from 'sweetalert2';
import { PrestentacionService } from '../../../services/prestentacion-service';
import { PresentacionDTO } from '../../../interfaces/Presentacion/PresentacionDTO';

@Component({
  selector: 'app-presentacion-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule],
  templateUrl: './presentacion-dialog.html',
  styleUrl: './presentacion-dialog.scss'
})
export class PresentacionDialog {

  form: FormGroup;
  titulo: string;

  constructor(
    private fb: FormBuilder,
    private service: PrestentacionService,
    public dialogRef: MatDialogRef<PresentacionDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { modo: 'crear' | 'editar'; presentacion?: PresentacionDTO }
  ) {
    this.titulo = data.modo === 'crear' ? 'Nueva presentacion' : 'Editar presentacion';

    this.form = this.fb.group({
      nombre: [data.presentacion?.nombre || '', Validators.required]
    });
  }

  guardar(): void {
    if (this.form.invalid) return;

    const dto = this.form.value;

    if (this.data.modo === 'crear') {
      this.service.crear(dto).subscribe({
        next: () => {
          Swal.fire('Éxito', 'Presentacion creada correctamente', 'success');
          this.dialogRef.close('guardado');
        },
        error: () => Swal.fire('Error', 'No se pudo crear la presentacion', 'error')
      });
    } else {
      this.service.editar(this.data.presentacion!.id, dto).subscribe({
        next: () => {
          Swal.fire('Éxito', 'Presentacion actualizada correctamente', 'success');
          this.dialogRef.close('guardado');
        },
        error: () => Swal.fire('Error', 'No se pudo actualizar la presentacion', 'error')
      });
    }
  }

  cancelar(): void {
    this.dialogRef.close();
  }

}
