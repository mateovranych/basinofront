import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import Swal from 'sweetalert2';
import { ProvinciaService } from '../../../services/provincia-service';
import { LocalidadService } from '../../../services/localidad-service';
import { Provincia } from '../../../interfaces/Provincia/Provincia';
import { MatSelectModule } from '@angular/material/select';
import { Localidad } from '../../../interfaces/Localidad/Localidad';


@Component({
  selector: 'app-localidades-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './localidades-dialog.html',
  styleUrl: './localidades-dialog.scss'
})
export class LocalidadesDialog {

  provincias: Provincia[] = [];
  form!: FormGroup;


  constructor(
    private fb: FormBuilder,
    private provinciasService: ProvinciaService,
    private localidadesService: LocalidadService,
    private dialogRef: MatDialogRef<LocalidadesDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { modo: 'crear' | 'editar'; localidad?: Localidad }
  ) {
    this.form = this.fb.group({
      nombre: [data.localidad?.nombre || '', Validators.required],
      provinciaId: [data.localidad?.provinciaId ?? null]
    });
  }

  ngOnInit() {
    this.provinciasService.obtenerProvincias().subscribe(res => this.provincias = res);
  }

  guardar() {
    if (this.data.modo === 'crear') {
      this.localidadesService.crearLocalidad(this.form.value).subscribe(() => {
        Swal.fire('Creada', 'Localidad creada', 'success');
        this.dialogRef.close('guardado');
      });
    } else {
      this.localidadesService.editarLocalidad(this.data.localidad!.id, this.form.value).subscribe(() => {
        Swal.fire('Actualizada', 'Localidad actualizada', 'success');
        this.dialogRef.close('guardado');
      });
    }

  }

  cancelar() {
    this.dialogRef.close();
  }



}
