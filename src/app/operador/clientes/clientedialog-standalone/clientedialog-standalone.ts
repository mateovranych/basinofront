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
import { Provincias } from '../../../admin/provincias/provincias';
import { ProvinciaService } from '../../../services/provincia-service';
import { LocalidadService } from '../../../services/localidad-service';
import { Provincia } from '../../../interfaces/Provincia/Provincia';
import { Localidad } from '../../../interfaces/Localidad/Localidad';

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


  provincias: Provincia[] = [];
  localidades: Localidad[] = [];
  localidadesFiltradas: Localidad[] = [];

  searchTerm = '';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ClientedialogStandalone>,
    private clienteService: ClientesService,
    private condicionService: CondicionesIvaService,
    private listasPrecioService: ListasPrecioService,
    private provinciaService: ProvinciaService,
    private localidadService: LocalidadService,

    @Inject(MAT_DIALOG_DATA) public data: Cliente | null
  ) { }

  ngOnInit(): void {

    this.form = this.fb.group({
      razonSocial: ['', Validators.required],
      alias: [''],

      cuit: ['', [Validators.required, Validators.pattern(/^[0-9]{11}$/)]],
      domicilio: [''],
      telefono: [''],
      email: ['', Validators.email],
      condicionIvaId: [null, Validators.required],
      listaPrecioId: [null, Validators.required],

      provinciaId: [null],
      localidadId: [null],

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

    this.provinciaService.obtenerProvincias().subscribe(res => {
      this.provincias = res;
    });

    this.localidadService.obtenerLocalidades().subscribe(res => {
      this.localidades = res;
      this.localidadesFiltradas = res;
      this.tryPatch();
    });

    this.form.get('provinciaId')?.valueChanges.subscribe(() => {
      this.onProvinciaChange();
    });


  }

  private tryPatch() {
    if (!this.data) return;

    if (this.condiciones.length === 0) return;
    if (this.listasPrecio.length === 0) return;

    setTimeout(() => {
      this.form.patchValue({
        razonSocial: this.data?.razonSocial,
        alias: this.data?.alias,
        provinciaId: this.data?.provinciaId,
        localidadId: this.data?.localidadId,
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

  onProvinciaChange() {
    const provinciaId = this.form.get('provinciaId')?.value;

    if (!provinciaId) {
      this.localidadesFiltradas = this.localidades;
      this.form.patchValue({ localidadId: null });
      return;
    }

    this.localidadesFiltradas = this.localidades.filter(
      l => l.provinciaId === provinciaId
    );

    this.form.patchValue({ localidadId: null });
  }


  cancelar() {
    this.dialogRef.close(false);
  }
}
