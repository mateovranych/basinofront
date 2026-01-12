import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';

import Swal from 'sweetalert2';

import { Proveedor } from '../../../interfaces/Proveedor';
import { ProveedoresService } from '../../../services/proveedores-service';
import { CondicionesIvaService } from '../../../services/condiciones-iva-service';
import { CondicionIva } from '../../../interfaces/CondicionIva';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-proveedores-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,

  ],
  templateUrl: './proveedores-dialog.html',
  styleUrl: './proveedores-dialog.scss'
})
export class ProveedoresDialog implements OnInit {
  titulo = '';
  form!: FormGroup;
  condiciones: CondicionIva[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ProveedoresDialog>,
    private proveedorService: ProveedoresService,
    private condicionService: CondicionesIvaService,
    @Inject(MAT_DIALOG_DATA) public data: Proveedor | null
  ) { }

  ngOnInit(): void {

    this.form = this.fb.group({
      razonSocial: ['', Validators.required],
      cuit: ['', Validators.required],
      domicilio: [''],
      telefono: [''],
      email: [''],
      condicionIvaId: [null, Validators.required],
      esActivo: [true],
    });

    this.titulo = this.data ? 'Editar Proveedor' : 'Nuevo Proveedor';

    this.condicionService.getAll().subscribe({
      next: (res) => {
        this.condiciones = res;

        if (this.data) {
          this.form.patchValue({
            razonSocial: this.data.razonSocial,
            cuit: this.data.cuit,
            domicilio: this.data.domicilio,
            telefono: this.data.telefono,
            email: this.data.email,
            condicionIvaId: this.data.condicionIvaId,
            esActivo: this.data.esActivo
          });
        }
      },
      error: () => Swal.fire('Error', 'No se pudieron cargar las condiciones IVA', 'error')
    });
  }

  cambiarEstado(activo: boolean): void {
    if (!this.data) return; // solo edita, no en crear

    this.proveedorService
      .cambiarEstado(this.data.id, activo)
      .subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: activo
              ? 'Proveedor activado'
              : 'Proveedor desactivado',
            timer: 1200,
            showConfirmButton: false
          });
        },
        error: () => {
          Swal.fire('Error', 'No se pudo cambiar el estado', 'error');
          // rollback visual
          this.form.get('esActivo')?.setValue(!activo, { emitEvent: false });
        }
      });
  }


  guardar(): void {
    if (this.form.invalid) return;

    const payload = { ...this.form.value };
    delete payload.esActivo; // 👈 importante

    const peticion = this.data
      ? this.proveedorService.update(this.data.id, payload)
      : this.proveedorService.create(payload);

    peticion.subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: this.data ? 'Proveedor actualizado' : 'Proveedor creado',
          timer: 1500,
          showConfirmButton: false
        });
        this.dialogRef.close(true);
      },
      error: () =>
        Swal.fire('Error', 'No se pudo guardar el proveedor', 'error')
    });
  }


  cancelar(): void {
    this.dialogRef.close(false);
  }

}
