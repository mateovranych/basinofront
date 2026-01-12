import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Categoria } from '../../../interfaces/Categoria';
import { ItemsService } from '../../../services/items-service';
import { Item } from '../../../interfaces/Items/Item';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import Swal from 'sweetalert2';
import { UnidadMedida } from '../../../interfaces/UnidadMedida';
import { UnidadMedidaService } from '../../../services/unidad-medida-service';
import { Proveedor } from '../../../interfaces/Proveedor';
import { ProveedoresService } from '../../../services/proveedores-service';

@Component({
  selector: 'app-items-dialog-component',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    FormsModule,
    NgxMatSelectSearchModule
  ],
  templateUrl: './items-dialog-component.html',
  styleUrl: './items-dialog-component.scss'
})
export class ItemsDialogComponent implements OnInit {

  form: FormGroup;
  titulo: string;
  categorias: Categoria[] = [];
  categoriasFiltradas: Categoria[] = [];
  filtroCategoriaCtrl = new FormControl('');

  unidadesMedida: UnidadMedida[] = [];
  unidadesMedidaFiltradas: UnidadMedida[] = [];
  filtroUnidadCtrl = new FormControl('');

  proveedores: Proveedor[] = [];
  proveedoresFiltrados: Proveedor[] = [];
  filtroProveedorCtrl = new FormControl('');


  constructor
    (
      private fb: FormBuilder,
      private service: ItemsService,
      private unidadService: UnidadMedidaService,
      private proveedoresService: ProveedoresService,
      public dialogRef: MatDialogRef<ItemsDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: { modo: 'crear' | 'editar'; item?: Item }



    ) {

    this.titulo = data.modo === 'crear' ? 'Nuevo ítem' : 'Editar ítem';

    this.form = this.fb.group({
      codigo: [data.item?.codigo || '', Validators.required],
      descripcion: [data.item?.descripcion || '', Validators.required],
      esServicio: [data.item?.esServicio || false],
      unidadMedidaId: [data.item?.unidadMedidaId || null, Validators.required],

      factorConversion: [data.item?.factorConversion ?? 1, [Validators.required, Validators.min(0.0001)]],
      unidadBaseId: [data.item?.unidadBaseId ?? null, Validators.required],

      proveedorId: [data.item?.proveedorId ?? null, Validators.required],

      categoriaId: [data.item?.categoriaId || null],
      requiereFrio: [data.item?.requiereFrio || false],
      habilitado: [data.item?.habilitado ?? true]

    }
    );
  }

  ngOnInit(): void {

    this.cargarProveedores();

    this.service.obtenerCategorias().subscribe({
      next: (res) => {
        this.categorias = res;
        this.categoriasFiltradas = [...res];
      },
      error: () => Swal.fire('Error', 'No se pudieron cargar las categorías', 'error')
    });

    this.filtroCategoriaCtrl.valueChanges.subscribe((valor) => {
      const filtro = valor?.toLowerCase() || '';
      this.categoriasFiltradas = this.categorias.filter((c) =>
        c.nombre.toLowerCase().includes(filtro)
      );
    });

    this.unidadService.obtenerUnidades().subscribe({
      next: (res) => {
        this.unidadesMedida = res;
        this.unidadesMedidaFiltradas = [...res];
      },
      error: () => Swal.fire('Error', 'No se pudieron cargar las unidades de medida', 'error')
    });

    this.filtroUnidadCtrl.valueChanges.subscribe((valor) => {
      const filtro = valor?.toLowerCase() || '';
      this.unidadesMedidaFiltradas = this.unidadesMedida.filter((u) =>
        u.nombre.toLowerCase().includes(filtro)
      );
    });



    console.log(this.data.item);

  }



  guardar(): void {
    if (this.form.invalid) return;

    const dto = this.form.value;

    const accion = this.data.modo === 'crear'
      ? this.service.crearItem(dto)
      : this.service.editarItem(this.data.item!.id, dto);

    accion.subscribe({
      next: () => {
        Swal.fire('Éxito', 'Ítem guardado correctamente', 'success');
        this.dialogRef.close('guardado');
      },
      error: () => Swal.fire('Error', 'No se pudo guardar el ítem', 'error')
    });



  }

  cancelar(): void {
    this.dialogRef.close();
  }


  cargarProveedores() {
    this.proveedoresService.getProveedoresActivos().subscribe(res => {

      this.proveedores = res.filter(p => p.id !== 1);
      this.proveedoresFiltrados = this.proveedores;

      if (this.data.modo === 'editar' && this.data.item?.proveedorId) {
        this.form.patchValue({
          proveedorId: this.data.item.proveedorId
        });
      }
    });

    this.filtroProveedorCtrl.valueChanges.subscribe(value => {
      const filtro = value?.toLowerCase() || '';
      this.proveedoresFiltrados = this.proveedores
        .filter(p => p.razonSocial.toLowerCase().includes(filtro));
    });
  }

}
