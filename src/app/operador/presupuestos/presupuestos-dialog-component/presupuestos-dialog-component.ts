import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormControl
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import Swal from 'sweetalert2';

import { PresupuestoService } from '../../../services/presupuesto-service';
import { ItemsService } from '../../../services/items-service';
import { ClientesService } from '../../../services/clientes-service';
import { PreciosService } from '../../../services/precio-service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Cliente } from '../../../interfaces/Cliente';
import { CondicionesIva } from '../../../admin/condiciones-iva/condiciones-iva';
import { ItemMin } from '../../../interfaces/Items/ItemMin';

type ClienteMin = {

  id: number;
  razonSocial: string;
  condicionIVA: string;

};

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
  titulo = 'NUEVO PRESUPUESTO';
  form!: FormGroup;

  clientes: ClienteMin[] = [];
  clientesFiltrados: ClienteMin[] = [];

  clienteSeleccionado: ClienteMin | null = null;


  filtroClientesCtrl = new FormControl('');

  items: ItemMin[] = [];
  itemsFiltrados: ItemMin[] = [];
  itemCodigoMap = new Map<number, string>();


  filtroItemsCtrl = new FormControl('');

  cargandoClientes = false;
  cargandoItems = false;

  constructor(
    private fb: FormBuilder,
    private presupuestosService: PresupuestoService,
    private itemsService: ItemsService,
    private clientesService: ClientesService,
    private precioService: PreciosService,
    public dialogRef: MatDialogRef<PresupuestosDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { modo: 'crear' | 'editar'; presupuesto?: any }
  ) {
    this.titulo =
      data?.modo === 'editar' ? 'Editar presupuesto' : 'Nuevo presupuesto';
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      clienteId: [null, Validators.required],
      detalles: this.fb.array<FormGroup>([])
    });

    this.agregarLinea();
    this.cargarClientes();
    this.cargarItems();

    this.filtroClientesCtrl.valueChanges.subscribe(valor => {
      const filtro = (valor || '').toLowerCase();
      this.clientesFiltrados = this.clientes.filter(c =>
        c.razonSocial.toLowerCase().includes(filtro)
      );
    });

    this.filtroItemsCtrl.valueChanges.subscribe(valor => {
      const filtro = (valor || '').toLowerCase();
      this.itemsFiltrados = this.items.filter(it =>
        it.descripcion.toLowerCase().includes(filtro)
      );
    });

    this.form.get('clienteId')?.valueChanges.subscribe(id => {
      this.clienteSeleccionado =
        this.clientes.find(c => c.id === id) || null;
    });
  }

  get detalles(): FormArray<FormGroup> {
    return this.form.get('detalles') as FormArray<FormGroup>;
  }

  get total(): number {
    return this.detalles.controls.reduce((acc, ctrl) => {
      const cantidad = Number(ctrl.get('cantidad')?.value || 0);
      const precio = Number(ctrl.get('precioUnitario')?.value || 0);
      return acc + cantidad * precio;
    }, 0);
  }


  nuevaLinea(): FormGroup {
    return this.fb.group({
      itemId: [null, Validators.required],

      // cantidad base (kg / unidad base) => la que se usa para subtotal
      cantidad: [0, [Validators.required, Validators.min(0.01)]],

      // cantidad comercial (hormas/cajas) => descriptivo + trazabilidad
      cantidadComercial: [1, [Validators.required, Validators.min(1)]],

      precioUnitario: [0, [Validators.required, Validators.min(0)]],

      // metadata para UI + cálculo estimado
      unidadComercial: [''],
      unidadBase: [''],
      factorConversion: [0]
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
    const clienteId = Number(this.form.get('clienteId')?.value);

    if (!clienteId) {
      Swal.fire('Atención', 'Primero seleccioná un cliente', 'warning');
      ctrl.get('itemId')?.setValue(null);
      return;
    }

    // 🔥 RESET DURO DEL PRECIO (CLAVE)
    ctrl.get('precioUnitario')?.setValue(0);

    const item = this.items.find(i => i.id === itemId);
    const pres = item?.presentacionDefault;

    if (pres) {
      ctrl.get('unidadComercial')?.setValue(pres.unidadComercial);
      ctrl.get('unidadBase')?.setValue(pres.unidadBase);
      ctrl.get('factorConversion')?.setValue(pres.factorConversion);

      const cantCom = Number(ctrl.get('cantidadComercial')?.value || 1);
      const estimadoBase = cantCom * Number(pres.factorConversion || 0);
      ctrl.get('cantidad')?.setValue(estimadoBase);
    } else {
      ctrl.get('unidadComercial')?.setValue('');
      ctrl.get('unidadBase')?.setValue('');
      ctrl.get('factorConversion')?.setValue(0);
    }

    // cargar precio por lista del cliente
    this.precioService.obtenerPrecioParaCliente(itemId, clienteId).subscribe({
      next: precio => {
        ctrl.get('precioUnitario')?.setValue(precio);
      },
      error: () => {
        Swal.fire(
          'Error',
          'El ítem no tiene un precio para la lista del cliente',
          'error'
        );
        ctrl.get('precioUnitario')?.setValue(0);
      }
    });
  }




  cargarClientes(): void {
    this.cargandoClientes = true;
    this.form.get('clienteId')?.disable();

    this.clientesService.getAll().subscribe({
      next: res => {
        this.clientes = res.map(c => ({
          id: c.id,
          razonSocial: c.razonSocial,
          condicionIVA: c.condicionIVA

        }));
        this.clientesFiltrados = [...this.clientes];
      },
      error: () =>
        Swal.fire('Error', 'No se pudieron cargar los clientes', 'error'),
      complete: () => {
        this.cargandoClientes = false;
        this.form.get('clienteId')?.enable();
      }
    });
  }

  cargarItems(): void {
    this.cargandoItems = true;

    this.itemsService.obtenerParaPresupuesto().subscribe({
      next: res => {

        this.items = res;
        this.itemsFiltrados = [...this.items];
        this.itemCodigoMap.clear();
        for (const it of this.items) {
          this.itemCodigoMap.set(it.id, it.codigo);
        }
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
      clienteId: Number(this.form.value.clienteId),
      detalles: this.detalles.controls.map(ctrl => ({
        itemId: Number(ctrl.get('itemId')?.value),
        cantidadComercial: Number(ctrl.get('cantidadComercial')?.value),

        cantidadReal: Number(ctrl.get('cantidad')?.value),

        precioUnitario: Number(ctrl.get('precioUnitario')?.value)
      }))
    };

    this.presupuestosService.crearPresupuesto(dto as any).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Presupuesto creado correctamente', 'success');
        this.dialogRef.close('guardado');
      },
      error: err => {
        const msg = err?.error?.mensaje || 'No se pudo crear el presupuesto';
        Swal.fire('Error', msg, 'error');
      }
    });
  }

  get subtotal(): number {
    return this.detalles.controls.reduce((acc, ctrl) => {
      const cantidad = Number(ctrl.get('cantidad')?.value || 0);
      const precio = Number(ctrl.get('precioUnitario')?.value || 0);
      return acc + cantidad * precio;
    }, 0);
  }

  get iva(): number {
    return this.subtotal * 0.21;
  }

  get totalFinal(): number {
    return this.subtotal + this.iva;
  }

  get discriminaIVA(): boolean {
    return this.clienteSeleccionado?.condicionIVA === 'Responsable Inscripto';
  }




  cancelar(): void {
    this.dialogRef.close();
  }
}
