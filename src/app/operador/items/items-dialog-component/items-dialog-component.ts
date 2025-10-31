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
import { Item } from '../../../interfaces/Item';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import Swal from 'sweetalert2';

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
  filtroCategoriaCtrl = new FormControl(''); // ✅ filtro del ngx-mat-select-search

  constructor(
    private fb: FormBuilder,
    private service: ItemsService,
    public dialogRef: MatDialogRef<ItemsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { modo: 'crear' | 'editar'; item?: Item }
  ) {
    this.titulo = data.modo === 'crear' ? 'Nuevo ítem' : 'Editar ítem';

    this.form = this.fb.group({
      codigo: [data.item?.codigo || '', Validators.required],
      descripcion: [data.item?.descripcion || '', Validators.required],
      precioVenta: [data.item?.precioVenta || '', [Validators.required, Validators.min(0)]],
      esServicio: [data.item?.esServicio || false],
      unidadMedida: [data.item?.unidadMedida || ''],
      categoriaId: [data.item?.categoriaId || null],
      fechaVencimiento: [data.item?.fechaVencimiento || ''],
      requiereFrio: [data.item?.requiereFrio || false]
    });
  }

  ngOnInit(): void {
    this.service.obtenerCategorias().subscribe({
      next: (res) => {
        this.categorias = res;
        this.categoriasFiltradas = [...res];
      },
      error: () => Swal.fire('Error', 'No se pudieron cargar las categorías', 'error')
    });

    // 🔍 Filtrado reactivo
    this.filtroCategoriaCtrl.valueChanges.subscribe((valor) => {
      const filtro = valor?.toLowerCase() || '';
      this.categoriasFiltradas = this.categorias.filter((c) =>
        c.nombre.toLowerCase().includes(filtro)
      );
    });
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
}
