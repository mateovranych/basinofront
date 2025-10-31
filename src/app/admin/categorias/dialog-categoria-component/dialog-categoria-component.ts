import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoriasService } from '../../../services/categorias-service';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Categoria } from '../../../interfaces/Categoria';
import Swal from 'sweetalert2';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-dialog-categoria-component',
  imports: [

    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './dialog-categoria-component.html',
  styleUrl: './dialog-categoria-component.scss'
})
export class DialogCategoriaComponent {

  form: FormGroup;
  titulo: string;

  constructor(
    private fb: FormBuilder,
    private service: CategoriasService,
    public dialogRef: MatDialogRef<DialogCategoriaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { modo: 'crear' | 'editar'; categoria?: Categoria }
  ) {
    this.titulo = data.modo === 'crear' ? 'Nueva categoría' : 'Editar categoría';

    this.form = this.fb.group({
      nombre: [data.categoria?.nombre || '', Validators.required]
    });
  }

  guardar(): void {
    if (this.form.invalid) return;

    const dto = this.form.value;

    if (this.data.modo === 'crear') {
      this.service.crearCategoria(dto).subscribe({
        next: () => {
          Swal.fire('Éxito', 'Categoría creada correctamente', 'success');
          this.dialogRef.close('guardado');
        },
        error: () => Swal.fire('Error', 'No se pudo crear la categoría', 'error')
      });
    } else {
      this.service.editarCategoria(this.data.categoria!.id, dto).subscribe({
        next: () => {
          Swal.fire('Éxito', 'Categoría actualizada correctamente', 'success');
          this.dialogRef.close('guardado');
        },
        error: () => Swal.fire('Error', 'No se pudo actualizar la categoría', 'error')
      });
    }
  }

  cancelar(): void {
    this.dialogRef.close();
  }

}
