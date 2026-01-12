import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProvinciaService } from '../../../services/provincia-service';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-provincias-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ]
  ,
  templateUrl: './provincias-dialog.html',
  styleUrl: './provincias-dialog.scss'
})

export class ProvinciasDialog {

  form!: FormGroup;
  titulo = 'Nueva provincia';

  constructor(
    private fb: FormBuilder,
    private service: ProvinciaService,
    private dialogRef: MatDialogRef<ProvinciasDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required]
    });
  }

  guardar() {
    this.service.crearProvincia(this.form.value!).subscribe(() => {
      Swal.fire('Guardado', '', 'success');
      this.dialogRef.close('guardado');
    });
  }

  cancelar() {
    this.dialogRef.close();
  }




}
