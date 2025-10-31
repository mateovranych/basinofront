import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import Swal from 'sweetalert2';
import { PresupuestoService } from '../../../services/presupuesto-service';
import { ItemsService } from '../../../services/items-service';
import { ClientesService } from '../../../services/clientes-service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

type ClienteMin = { id: number; razonSocial: string };
type ItemMin = { id: number; descripcion: string; precioVenta: number };

@Component({
  selector: 'app-presupuestos-dialog-component',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    NgxMatSelectSearchModule
  ],
  templateUrl: './presupuestos-dialog-component.html',
  styleUrls: ['./presupuestos-dialog-component.scss']
})
export class PresupuestosDialogComponent implements OnInit {
  titulo = 'Nuevo presupuesto';
  form!: FormGroup;

  clientes: ClienteMin[] = [];
  clientesFiltrados: ClienteMin[] = [];
  filtroClientesCtrl = new FormControl('');

  items: ItemMin[] = [];
  itemsFiltrados: ItemMin[] = [];
  filtroItemsCtrl = new FormControl('');

  cargandoClientes = false;
  cargandoItems = false;

  constructor(
    private fb: FormBuilder,
    private presupuestosService: PresupuestoService,
    private itemsService: ItemsService,
    private clientesService: ClientesService,
    public dialogRef: MatDialogRef<PresupuestosDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { modo: 'crear' | 'editar'; presupuesto?: any }
  ) {
    this.titulo = data?.modo === 'editar' ? 'Editar presupuesto' : 'Nuevo presupuesto';
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      clienteId: [null, Validators.required],
      detalles: this.fb.array<FormGroup>([])
    });

    this.agregarLinea();
    this.cargarClientes();
    this.cargarItems();

    this.filtroClientesCtrl.valueChanges.subscribe((valor) => {
      const filtro = (valor || '').toLowerCase();
      this.clientesFiltrados = this.clientes.filter(c =>
        c.razonSocial.toLowerCase().includes(filtro)
      );
    });

    this.filtroItemsCtrl.valueChanges.subscribe((valor) => {
      const filtro = (valor || '').toLowerCase();
      this.itemsFiltrados = this.items.filter(it =>
        it.descripcion.toLowerCase().includes(filtro)
      );
    });
  }

  get detalles(): FormArray<FormGroup> {
    return this.form.get('detalles') as FormArray<FormGroup>;
  }

  get total(): number {
    return this.detalles.controls.reduce((acc, ctrl) => {
      const c = Number(ctrl.get('cantidad')?.value || 0);
      const p = Number(ctrl.get('precioUnitario')?.value || 0);
      return acc + c * p;
    }, 0);
  }

  nuevaLinea(): FormGroup {
    return this.fb.group({
      itemId: [null, Validators.required],
      cantidad: [1, [Validators.required, Validators.min(0.01)]],
      precioUnitario: [0, [Validators.required, Validators.min(0)]],
      descripcionVista: ['']
    });
  }

  agregarLinea(): void {
    this.detalles.push(this.nuevaLinea());
  }

  quitarLinea(index: number): void {
    this.detalles.removeAt(index);
  }

  onItemChange(index: number): void {
    const ctrl = this.detalles.at(index);
    const itemId = Number(ctrl.get('itemId')?.value);
    const item = this.items.find(i => i.id === itemId);
    if (item) {
      ctrl.get('precioUnitario')?.setValue(item.precioVenta ?? 0);
      ctrl.get('descripcionVista')?.setValue(item.descripcion);
    }
  }

  cargarClientes(): void {
    this.cargandoClientes = true;
    this.form.get('clienteId')?.disable();
    this.clientesService.getAll().subscribe({
      next: (res) => {
        this.clientes = res.map(c => ({ id: c.id, razonSocial: c.razonSocial }));
        this.clientesFiltrados = [...this.clientes];
      },
      error: () => Swal.fire('Error', 'No se pudieron cargar los clientes', 'error'),
      complete: () => {
        this.cargandoClientes = false;
        this.form.get('clienteId')?.enable();
      }
    });
  }

  cargarItems(): void {
    this.cargandoItems = true;
    this.itemsService.obtenerItems().subscribe({
      next: (res) => {
        this.items = res.map(i => ({
          id: i.id,
          descripcion: i.descripcion,
          precioVenta: i.precioVenta
        }));
        this.itemsFiltrados = [...this.items];
      },
      error: () => Swal.fire('Error', 'No se pudieron cargar los ítems', 'error'),
      complete: () => (this.cargandoItems = false)
    });
  }

  guardar(): void {
    if (this.form.invalid || this.detalles.length === 0) {
      Swal.fire('Atención', 'Completá cliente y al menos un ítem válido.', 'warning');
      return;
    }

    const dto = {
      clienteId: this.form.value.clienteId,
      detalles: this.detalles.controls.map(ctrl => ({
        itemId: Number(ctrl.get('itemId')?.value),
        cantidad: Number(ctrl.get('cantidad')?.value),
        precioUnitario: Number(ctrl.get('precioUnitario')?.value)
      }))
    };

    this.presupuestosService.crearPresupuesto(dto).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Presupuesto creado correctamente', 'success');
        this.dialogRef.close('guardado');
      },
      error: (err) => {
        const msg = err?.error?.mensaje || 'No se pudo crear el presupuesto';
        Swal.fire('Error', msg, 'error');
      }
    });
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
