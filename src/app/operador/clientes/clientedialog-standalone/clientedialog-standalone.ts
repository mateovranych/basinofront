import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import Swal from 'sweetalert2';

import { Cliente } from '../../../interfaces/Cliente';
import { ClientesService } from '../../../services/clientes-service';
import { CondicionesIvaService } from '../../../services/condiciones-iva-service';
import { ListasPrecioService } from '../../../services/lista-precio-service';

import { CondicionIva } from '../../../interfaces/CondicionIva';
import { ListaPrecio } from '../../../interfaces/ListaPrecio';

@Component({
  selector: 'app-clientedialog-standalone',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    NgxMatSelectSearchModule,
  ],
  templateUrl: './clientedialog-standalone.html',
  styleUrl: './clientedialog-standalone.scss'
})
export class ClientedialogStandalone implements OnInit {

  titulo = '';
  form!: FormGroup;

  condiciones: CondicionIva[] = [];
  filteredCondiciones: CondicionIva[] = [];
  listasPrecio: ListaPrecio[] = [];

  searchTerm = '';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ClientedialogStandalone>,
    private clienteService: ClientesService,
    private condicionService: CondicionesIvaService,
    private listasPrecioService: ListasPrecioService,
    @Inject(MAT_DIALOG_DATA) public data: Cliente | null
  ) {}

  ngOnInit(): void {

    this.form = this.fb.group({
      razonSocial: ['', Validators.required],
      cuit: ['', [Validators.required, Validators.pattern(/^[0-9]{11}$/)]],
      domicilio: [''],
      telefono: [''],
      email: ['', Validators.email],
      condicionIvaId: [null, Validators.required],
      listaPrecioId: [null, Validators.required],
      tieneCuentaCorriente: [false],
      esActivo: [true],
    });

    this.titulo = this.data ? 'Editar Cliente' : 'Nuevo Cliente';

    this.condicionService.getAll().subscribe({
      next: (res) => {
        this.condiciones = res;
        this.filteredCondiciones = res;
        this.tryPatch();
      },
      error: (err) => console.error(err)
    });

    this.listasPrecioService.getAll().subscribe({
      next: (res) => {
        this.listasPrecio = res;
        this.tryPatch();
      },
      error: (err) => console.error(err)
    });
  }

  private tryPatch() {
    if (!this.data) return;

    if (this.condiciones.length === 0) return;
    if (this.listasPrecio.length === 0) return;

    setTimeout(() => {
      this.form.patchValue({
        razonSocial: this.data?.razonSocial,
        cuit: this.data?.cuit,
        domicilio: this.data?.domicilio,
        telefono: this.data?.telefono,
        email: this.data?.email,
        condicionIvaId: this.data?.condicionIvaId,
        listaPrecioId: this.data?.listaPrecioId,
        tieneCuentaCorriente: this.data?.tieneCuentaCorriente,
        esActivo: this.data?.esActivo
      });
    });
  }

  guardar() {
    if (this.form.invalid) return;

    const payload = this.form.getRawValue() as Partial<Cliente>;

    if (this.data) payload.id = this.data.id;

    const peticion = this.data
      ? this.clienteService.update(this.data.id, payload)
      : this.clienteService.create(payload);

    peticion.subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: this.data ? 'Cliente actualizado' : 'Cliente creado',
          timer: 1500,
          showConfirmButton: false
        });
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'No se pudo guardar el cliente.', 'error');
      },
    });
  }

  cancelar() {
    this.dialogRef.close(false);
  }
}
