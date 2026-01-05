import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, ElementRef, HostListener, Inject, OnInit, ViewChild } from '@angular/core';
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
import { MatSelect, MatSelectModule } from '@angular/material/select';
import Swal from 'sweetalert2';

import { PresupuestoService } from '../../../services/presupuesto-service';
import { ItemsService } from '../../../services/items-service';
import { ClientesService } from '../../../services/clientes-service';
import { PreciosService } from '../../../services/precio-service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ItemMin } from '../../../interfaces/Items/ItemMin';

type ClienteMin = {
  id: number;
  razonSocial: string;
  condicionIVA: string;
  listaPrecioNombre: string;
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

  items: ItemMin[] = [];
  itemsFiltrados: ItemMin[] = [];
  itemCodigoMap = new Map<number, string>();

  filtroClientesCtrl = new FormControl('');

  filtroItemsCtrl = new FormControl('');

  cargandoClientes = false;
  cargandoItems = false;

  @ViewChild('dialogContent') dialogContent!: ElementRef<HTMLElement>;
  @ViewChild('clienteSelect') clienteSelect!: MatSelect;




  @HostListener('document:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent): void {


    if (event.ctrlKey && event.code === 'Space') {
      event.preventDefault();
      this.agregarLinea();
    }

  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.clienteSelect.focus();
    });
  }


  private readonly IVA = 0.21;

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

  // ============================
  // INIT
  // ============================
  ngOnInit(): void {
    this.form = this.fb.group({
      clienteId: [null, Validators.required],
      totalManual: [null],
      detalles: this.fb.array<FormGroup>([]),

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
      const filtro = (valor || '').toLowerCase().trim();

      this.itemsFiltrados = this.items.filter(it => {
        const textoBusqueda = `${it.codigo} ${it.descripcion}`.toLowerCase();
        return textoBusqueda.includes(filtro);
      });
    });


    this.form.get('clienteId')?.valueChanges.subscribe(id => {
      this.clienteSeleccionado =
        this.clientes.find(c => c.id === id) || null;

      this.recalcularPreciosPorCliente();

      setTimeout(() => {
        this.focusPrimerCodigo();
      });
    });
  }

  // ============================
  // FORM HELPERS
  // ============================
  get detalles(): FormArray<FormGroup> {
    return this.form.get('detalles') as FormArray<FormGroup>;
  }

  get discriminaIVA(): boolean {
    return this.clienteSeleccionado?.condicionIVA === 'Responsable Inscripto';
  }

  nuevaLinea(): FormGroup {
    return this.fb.group({
      codigoInput: [''],
      itemId: [null, Validators.required],

      filtroItemCtrl: new FormControl(''),

      cantidad: [0, [Validators.required, Validators.min(0.01)]],
      cantidadComercial: [1, [Validators.required, Validators.min(1)]],
      precioUnitario: [0, [Validators.required, Validators.min(0)]],
      unidadComercial: [''],
      unidadBase: [''],
      factorConversion: [0],


      esServicio: [false],           // 👈 NUEVO
      observaciones: ['']             // 👈 NUEVO
    });
  }

  agregarLinea(): void {
    this.detalles.push(this.nuevaLinea());

    // Espera a que Angular renderice la nueva fila
    setTimeout(() => {
      this.scrollAlFinal();
      this.focusUltimoCodigo();
    });
  }

  quitarLinea(index: number): void {
    this.detalles.removeAt(index);
  }


  scrollAlFinal(): void {
    const el = this.dialogContent.nativeElement;
    el.scrollTop = el.scrollHeight;
  }

  focusUltimoCodigo(): void {
    setTimeout(() => {
      const codigos = document.querySelectorAll<HTMLElement>('mat-select.codigo-select');
      if (codigos.length > 0) {
        codigos[codigos.length - 1].focus();
      }
    });
  }

  focusPrimerCodigo(): void {
    const codigos = document.querySelectorAll<HTMLElement>('mat-select.codigo-select');
    if (codigos.length > 0) {
      codigos[0].focus();
    }
  }





  // ============================
  // ITEM CHANGE
  // ============================


  onItemChange(index: number): void {




    const ctrl = this.detalles.at(index);
    const itemId = Number(ctrl.get('itemId')?.value);
    const clienteId = Number(this.form.get('clienteId')?.value);

    if (!clienteId) {
      Swal.fire('Atención', 'Primero seleccioná un cliente', 'warning');
      ctrl.get('itemId')?.setValue(null);
      return;
    }

    ctrl.get('precioUnitario')?.setValue(0);

    const item = this.items.find(i => i.id === itemId);
    if (!item) return;

    console.log('ITEM SELECCIONADO:', item);
    console.log('esServicio:', item.esServicio);

    // 🔹 Marcamos si es servicio
    ctrl.patchValue({
      esServicio: item.esServicio
    });

    // 🔴 SI ES SERVICIO → SALIMOS ACÁ
    if (item.esServicio) {
      ctrl.patchValue({
        cantidadComercial: 1,
        cantidad: 1,
        unidadComercial: '',
        unidadBase: '',
        factorConversion: 0
      });

      // El precio sí se carga, pero NO conversión ni kg
      this.precioService.obtenerPrecioParaCliente(itemId, clienteId).subscribe({
        next: precio => {
          ctrl.get('precioUnitario')?.setValue(Number(precio.toFixed(2)));
        },
        error: () => {
          Swal.fire('Error', 'El servicio no tiene precio configurado', 'error');
          ctrl.get('precioUnitario')?.setValue(0);
        }
      });

      return; // ⬅️ ESTE ES EL RETURN CLAVE
    }

    // ======================
    // 👇 DESDE ACÁ SOLO PRODUCTOS
    // ======================

    const pres = item.presentacionDefault;

    if (pres) {
      ctrl.patchValue({
        unidadComercial: pres.unidadComercial,
        unidadBase: pres.unidadBase,
        factorConversion: pres.factorConversion,
        cantidad:
          Number(ctrl.get('cantidadComercial')?.value || 1) *
          Number(pres.factorConversion || 0)
      });

      this.recalcularCantidadBase(ctrl);
    }

    this.precioService.obtenerPrecioParaCliente(itemId, clienteId).subscribe({
      next: precio => {
        ctrl.get('precioUnitario')?.setValue(Number(precio.toFixed(2)));
      },
      error: () => {
        Swal.fire('Error', 'El ítem no tiene precio configurado', 'error');
        ctrl.get('precioUnitario')?.setValue(0);
      }
    });
  }





  // ============================
  // VISUAL
  // ============================
  precioUnitarioVisual(ctrl: FormGroup): number {
    const base = Number(ctrl.get('precioUnitario')?.value || 0);
    return this.discriminaIVA ? base : base * (1 + this.IVA);
  }

  subtotalVisual(ctrl: FormGroup): number {
    const cantidad = Number(ctrl.get('cantidad')?.value || 0);
    const base = Number(ctrl.get('precioUnitario')?.value || 0);
    const subtotalBase = cantidad * base;

    return this.discriminaIVA
      ? subtotalBase
      : subtotalBase * (1 + this.IVA);
  }

  // ============================
  // TOTALES
  // ============================
  get subtotal(): number {
    return this.detalles.controls.reduce((acc, ctrl) => {
      const cantidad = Number(ctrl.get('cantidad')?.value || 0);
      const base = Number(ctrl.get('precioUnitario')?.value || 0);
      return acc + cantidad * base;
    }, 0);
  }

  get iva(): number {
    return this.discriminaIVA ? this.subtotal * this.IVA : 0;
  }

  // get totalFinal(): number {
  //   const base = this.subtotal;
  //   return this.discriminaIVA
  //     ? base + this.iva
  //     : base * (1 + this.IVA);
  // }

  get totalFinal(): number {

    if (this.totalManual !== null) {
      return this.totalManual;
    }

    const base = this.subtotal;

    return this.discriminaIVA
      ? base + this.iva
      : base * (1 + this.IVA);
  }


  get totalManualCtrl(): FormControl {
    return this.form.get('totalManual') as FormControl;
  }

  get totalManual(): number | null {
    const v = this.totalManualCtrl.value;
    return v !== null && v !== '' ? Number(v) : null;
  }


  // ============================
  // INPUT MANUAL
  // ============================
  onPrecioVisualInput(ctrl: FormGroup, event: Event): void {
    const raw = (event.target as HTMLInputElement).value ?? '';
    const normalized = raw.replace(/\./g, '').replace(',', '.');
    const visual = Number(normalized);

    if (Number.isNaN(visual)) {
      ctrl.get('precioUnitario')?.setValue(0);
      return;
    }

    const base = this.discriminaIVA
      ? visual
      : visual / (1 + this.IVA);

    ctrl.get('precioUnitario')?.setValue(Number(base.toFixed(2)));
  }

  onPrecioVisualBlur(ctrl: FormGroup): void {
    const visual = Number(ctrl.get('precioVisual')?.value || 0);

    const base = this.discriminaIVA
      ? visual
      : visual / (1 + this.IVA);

    ctrl.get('precioUnitario')?.setValue(Number(base.toFixed(2)));
  }



  // ============================
  // DATA LOAD
  // ============================
  cargarClientes(): void {
    this.cargandoClientes = true;
    this.form.get('clienteId')?.disable();

    this.clientesService.getAll().subscribe({
      next: res => {
        this.clientes = res.map(c => ({
          id: c.id,
          razonSocial: c.razonSocial,
          condicionIVA: c.condicionIVA,
          listaPrecioNombre: c.listaPrecioNombre ?? '-'
        }));
        this.clientesFiltrados = [...this.clientes];
      },
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
        res.forEach(it => this.itemCodigoMap.set(it.id, it.codigo));
      },
      complete: () => (this.cargandoItems = false)
    });
  }

  // ============================
  // GUARDAR
  // ============================
  guardar(): void {
    if (this.form.invalid || this.detalles.length === 0) {
      Swal.fire('Atención', 'Completá cliente e ítems válidos', 'warning');
      return;
    }

    const detallesDto = this.detalles.controls.map(ctrl => ({
      itemId: Number(ctrl.get('itemId')?.value),
      cantidadComercial: Number(ctrl.get('cantidadComercial')?.value),
      cantidadReal: Number(ctrl.get('cantidad')?.value),
      precioUnitario: Number(ctrl.get('precioUnitario')?.value),
      observaciones: ctrl.get('observaciones')?.value || null
    }));

    this.presupuestosService.crearPresupuesto({
      clienteId: Number(this.form.value.clienteId),
      totalManual: this.totalManual,
      detalles: detallesDto
    } as any).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Presupuesto creado', 'success');
        this.dialogRef.close('guardado');
      },
      error: () =>
        Swal.fire('Error', 'No se pudo crear el presupuesto', 'error')
    });
  }

  resetearTotal(): void {
    this.form.get('totalManual')?.setValue(null);
  }

  onCodigoSeleccionado(ctrl: FormGroup, itemId: number): void {

    ctrl.get('itemId')?.setValue(itemId);

    const index = this.detalles.controls.indexOf(ctrl);
    this.onItemChange(index);
  }

  filtrarItemsPorLinea(ctrl: FormGroup): ItemMin[] {
    const filtro = (ctrl.get('filtroItemCtrl')?.value || '')
      .toLowerCase()
      .trim();

    return this.items.filter(it =>
      `${it.codigo} ${it.descripcion}`.toLowerCase().includes(filtro)
    );
  }

  getFiltroItemCtrl(det: FormGroup): FormControl {
    return det.get('filtroItemCtrl') as FormControl;
  }

  getCodigoPorItemId(itemId: number | null): string {
    if (!itemId) return '';
    return this.items.find(i => i.id === itemId)?.codigo ?? '';
  }

  cancelar(): void {
    this.dialogRef.close();
  }


  private recalcularCantidadBase(ctrl: FormGroup): void {
    const cantidadComercialCtrl = ctrl.get('cantidadComercial');
    const factorCtrl = ctrl.get('factorConversion');
    const cantidadBaseCtrl = ctrl.get('cantidad');

    if (!cantidadComercialCtrl || !factorCtrl || !cantidadBaseCtrl) return;

    cantidadComercialCtrl.valueChanges.subscribe(value => {
      const cantidad = Number(value || 0);
      const factor = Number(factorCtrl.value || 0);

      if (factor > 0) {
        cantidadBaseCtrl.setValue(
          Number((cantidad * factor).toFixed(2)),
          { emitEvent: false }
        );
      }
    });
  }

  private recalcularPreciosPorCliente(): void {
    const clienteId = Number(this.form.get('clienteId')?.value);
    if (!clienteId) return;

    this.detalles.controls.forEach((ctrl, index) => {
      const itemId = Number(ctrl.get('itemId')?.value);
      if (!itemId) return;

      this.precioService.obtenerPrecioParaCliente(itemId, clienteId).subscribe({
        next: precio => {
          ctrl.get('precioUnitario')?.setValue(Number(precio.toFixed(2)));
        },
        error: () => {
          ctrl.get('precioUnitario')?.setValue(0);
        }
      });
    });
  }


}
