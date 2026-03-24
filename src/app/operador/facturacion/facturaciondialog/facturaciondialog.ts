import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, ElementRef, HostListener, Inject, OnInit, ViewChild } from '@angular/core';
import {
  FormArray, FormBuilder, FormControl,
  FormGroup, ReactiveFormsModule, Validators
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import Swal from 'sweetalert2';

import { FacturaService } from '../../../services/factura-service';
import { ItemsService } from '../../../services/items-service';
import { ClientesService } from '../../../services/clientes-service';
import { PreciosService } from '../../../services/precio-service';
import { ItemMin } from '../../../interfaces/Items/ItemMin';
import { TipoComprobante } from '../../../interfaces/Factura/TipoComprobante';


type ClienteMin = {
  id: number;
  razonSocial: string;
  condicionIVA: string;
  condicionIvaId: number;
  listaPrecioNombre: string;
};

@Component({
  selector: 'app-facturacion-dialog',
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
    NgxMatSelectSearchModule,
    MatSlideToggleModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './facturaciondialog.html',
  styleUrl: './facturaciondialog.scss'
})
export class Facturaciondialog implements OnInit {

  titulo = 'NUEVA FACTURA ARCA';
  form!: FormGroup;
  guardando = false;

  clientes: ClienteMin[] = [];
  clientesFiltrados: ClienteMin[] = [];
  clienteSeleccionado: ClienteMin | null = null;

  items: ItemMin[] = [];
  cargandoClientes = false;
  cargandoItems = false;

  filtroClientesCtrl = new FormControl('');

  tiposComprobante: TipoComprobante[] = [
    { id: 1, nombre: 'Factura A', codigoAfip: 1 },
    { id: 2, nombre: 'Factura B', codigoAfip: 6 },
    { id: 3, nombre: 'Factura C', codigoAfip: 11 },
  ];

  private readonly IVA = 0.21;
  // private readonly PUNTO_VENTA_DEFAULT = 10;

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
    setTimeout(() => this.clienteSelect?.focus());
  }

  constructor(
    private fb: FormBuilder,
    private facturaService: FacturaService,
    private itemsService: ItemsService,
    private clientesService: ClientesService,
    private precioService: PreciosService,
    public dialogRef: MatDialogRef<Facturaciondialog>,
    @Inject(MAT_DIALOG_DATA) public data: { modo: 'crear' }
  ) { }

  // ============================
  // INIT
  // ============================
  ngOnInit(): void {
    this.form = this.fb.group({
      clienteId: [null, Validators.required],
      tipoComprobanteId: [null, Validators.required],
      // puntoVenta: [this.PUNTO_VENTA_DEFAULT, Validators.required],
      concepto: [1, Validators.required], 
      forzarNoDiscriminarIVA: [false],
      fechaServicioDesde: [null],
      fechaServicioHasta: [null],
      fechaVencimientoPago: [null, Validators.required],
      detalles: this.fb.array<FormGroup>([])
    });

    this.agregarLinea();
    this.cargarClientes();
    this.cargarItems();

    this.actualizarValidacionFechasServicio(1);

    this.filtroClientesCtrl.valueChanges.subscribe(valor => {
      const filtro = (valor || '').toLowerCase();
      this.clientesFiltrados = this.clientes.filter(c =>
        c.razonSocial.toLowerCase().includes(filtro)
      );
    });

    this.form.get('clienteId')?.valueChanges.subscribe(id => {
      this.clienteSeleccionado = this.clientes.find(c => c.id === id) || null;
      this.form.get('forzarNoDiscriminarIVA')?.setValue(false, { emitEvent: false });
      this.actualizarTipoComprobanteSugerido();
      this.recalcularPreciosPorCliente();
      setTimeout(() => this.focusPrimerCodigo());
    });

    this.form.get('forzarNoDiscriminarIVA')?.valueChanges.subscribe(() => {
      this.recalcularVisualesPorCambioIva();
    });

    this.form.get('concepto')?.valueChanges.subscribe(concepto => {
      this.actualizarValidacionFechasServicio(concepto);
    });
  }

  // ============================
  // TIPO COMPROBANTE AUTOMÁTICO
  // ============================
  actualizarTipoComprobanteSugerido(): void {
    if (!this.clienteSeleccionado) return;
    const id = this.clienteSeleccionado.condicionIvaId;
    // 1=RI → Factura A, resto → Factura C
    const tipoId = id === 1 ? 1 : 3;
    this.form.get('tipoComprobanteId')?.setValue(tipoId, { emitEvent: false });
  }

  // ============================
  // VALIDACIÓN FECHAS SERVICIO
  // ============================
  actualizarValidacionFechasServicio(concepto: number): void {
    const desde = this.form.get('fechaServicioDesde');
    const hasta = this.form.get('fechaServicioHasta');

    if (concepto !== 1) {
      desde?.setValidators(Validators.required);
      hasta?.setValidators(Validators.required);
    } else {
      desde?.clearValidators();
      hasta?.clearValidators();
    }

    desde?.updateValueAndValidity();
    hasta?.updateValueAndValidity();
  }

  get requiereFechasServicio(): boolean {
    return this.form.get('concepto')?.value !== 1;
  }

  // ============================
  // FORM HELPERS
  // ============================
  get detalles(): FormArray<FormGroup> {
    return this.form.get('detalles') as FormArray<FormGroup>;
  }

  get discriminaIVA(): boolean {
    const esRI = this.clienteSeleccionado?.condicionIvaId === 1;
    const forzarNo = this.form.get('forzarNoDiscriminarIVA')?.value === true;
    return esRI && !forzarNo;
  }

  get puedeEmitirComoNoCategorizado(): boolean {
    const id = this.clienteSeleccionado?.condicionIvaId;
    return id === 1 || id === 2; // RI o Monotributista
  }

  nuevaLinea(): FormGroup {
    return this.fb.group({
      itemId: [null, Validators.required],
      filtroItemCtrl: new FormControl(''),
      cantidad: [0, [Validators.required, Validators.min(0.01)]],
      cantidadComercial: [1, [Validators.required, Validators.min(1)]],
      precioUnitario: [0, [Validators.required, Validators.min(0)]],
      precioVisual: [''],
      unidadComercial: [''],
      unidadBase: [''],
      factorConversion: [0],
      esServicio: [false],
      observaciones: ['']
    });
  }

  agregarLinea(): void {
    this.detalles.push(this.nuevaLinea());
    setTimeout(() => {
      this.scrollAlFinal();
      this.focusUltimoCodigo();
    });
  }

  quitarLinea(index: number): void {
    this.detalles.removeAt(index);
  }

  scrollAlFinal(): void {
    const el = this.dialogContent?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }

  focusUltimoCodigo(): void {
    setTimeout(() => {
      const codigos = document.querySelectorAll<HTMLElement>('mat-select.codigo-select');
      if (codigos.length > 0) codigos[codigos.length - 1].focus();
    });
  }

  focusPrimerCodigo(): void {
    const codigos = document.querySelectorAll<HTMLElement>('mat-select.codigo-select');
    if (codigos.length > 0) codigos[0].focus();
  }

  // ============================
  // ITEMS
  // ============================
  filtrarItemsPorLinea(ctrl: FormGroup): ItemMin[] {
    const filtro = (ctrl.get('filtroItemCtrl')?.value || '').toLowerCase().trim();
    return this.items.filter(it =>
      `${it.codigo} ${it.descripcion}`.toLowerCase().includes(filtro)
    );
  }

  getFiltroItemCtrl(det: FormGroup): FormControl {
    return det.get('filtroItemCtrl') as FormControl;
  }

  onCodigoSeleccionado(ctrl: FormGroup, itemId: number): void {
    ctrl.get('itemId')?.setValue(itemId);
    const index = this.detalles.controls.indexOf(ctrl);
    this.onItemChange(index);
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

    ctrl.patchValue({ precioUnitario: 0, precioVisual: '' });

    const item = this.items.find(i => i.id === itemId);
    if (!item) return;

    ctrl.patchValue({ esServicio: item.esServicio });

    if (item.esServicio) {
      ctrl.patchValue({
        cantidadComercial: 1, cantidad: 1,
        unidadComercial: '', unidadBase: '', factorConversion: 0
      });
    } else {
      const pres = item.presentacionDefault;
      if (pres) {
        ctrl.patchValue({
          unidadComercial: pres.unidadComercial,
          unidadBase: pres.unidadBase,
          factorConversion: pres.factorConversion,
          cantidad: Number(ctrl.get('cantidadComercial')?.value || 1) * Number(pres.factorConversion || 0)
        });
        this.recalcularCantidadBase(ctrl);
      }
    }

    this.precioService.obtenerPrecioParaCliente(itemId, clienteId).subscribe({
      next: precio => {
        const base = Number(precio.toFixed(2));
        ctrl.patchValue({
          precioUnitario: base,
          precioVisual: this.discriminaIVA
            ? base.toFixed(2)
            : (base * (1 + this.IVA)).toFixed(2)
        });
      },
      error: () => {
        Swal.fire('Error', 'El ítem no tiene precio configurado', 'error');
        ctrl.patchValue({ precioUnitario: 0, precioVisual: '' });
      }
    });
  }

  // ============================
  // VISUAL
  // ============================
  subtotalVisual(ctrl: FormGroup): number {
    const cantidad = Number(ctrl.get('cantidad')?.value || 0);
    const base = Number(ctrl.get('precioUnitario')?.value || 0);
    const sub = cantidad * base;
    return this.discriminaIVA ? sub : sub * (1 + this.IVA);
  }

  onPrecioVisualInput(ctrl: FormGroup): void {
    const precioCtrl = ctrl.get('precioVisual');
    if (!precioCtrl) return;

    let value = (precioCtrl.value?.toString() ?? '').replace(',', '.').replace(/[^0-9.]/g, '');
    const parts = value.split('.');
    if (parts.length > 2) value = parts[0] + '.' + parts.slice(1).join('');
    precioCtrl.setValue(value, { emitEvent: false });

    const visual = Number(value);
    if (Number.isNaN(visual)) return;

    const base = this.discriminaIVA ? visual : visual / (1 + this.IVA);
    ctrl.get('precioUnitario')?.setValue(Number(base.toFixed(2)), { emitEvent: false });
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

  get totalFinal(): number {
    return this.discriminaIVA
      ? this.subtotal + this.iva
      : this.subtotal * (1 + this.IVA);
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
          condicionIvaId: c.condicionIvaId,
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
      },
      complete: () => (this.cargandoItems = false)
    });
  }

  // ============================
  // GUARDAR
  // ============================
  guardar(): void {
    if (this.form.invalid || this.detalles.length === 0) {
      Swal.fire('Atención', 'Completá todos los campos requeridos', 'warning');
      return;
    }

    const v = this.form.value;

    const detallesDto = this.detalles.controls.map(ctrl => ({
      itemId: Number(ctrl.get('itemId')?.value),
      cantidadComercial: Number(ctrl.get('cantidadComercial')?.value),
      cantidadReal: Number(ctrl.get('cantidad')?.value),
      precioUnitario: Number(ctrl.get('precioUnitario')?.value),
      observaciones: ctrl.get('observaciones')?.value || null
    }));

    const dto = {
      clienteId: Number(this.form.getRawValue().clienteId),
      tipoComprobanteId: Number(v.tipoComprobanteId),
      // puntoVenta: Number(v.puntoVenta),
      concepto: Number(v.concepto),
      forzarNoDiscriminarIVA: v.forzarNoDiscriminarIVA,
      fechaServicioDesde: v.fechaServicioDesde
        ? this.formatearFecha(v.fechaServicioDesde) : undefined,
      fechaServicioHasta: v.fechaServicioHasta
        ? this.formatearFecha(v.fechaServicioHasta) : undefined,
      fechaVencimientoPago: this.formatearFecha(v.fechaVencimientoPago),
      detalles: detallesDto
    };

    this.guardando = true;

    this.facturaService.crearFactura(dto).subscribe({
      next: (factura) => {
        this.guardando = false;
        if (factura.autorizadaEnARCA) {
          Swal.fire('Factura autorizada', `CAE: ${factura.cae}`, 'success');
        } else {
          Swal.fire(
            'Factura guardada sin autorizar',
            factura.arcaMensajeError || 'ARCA no autorizó. Podés reintentar desde la tabla.',
            'warning'
          );
        }
        this.dialogRef.close('guardado');
      },
      error: (err) => {
        this.guardando = false;
        const mensaje = err.error?.message || 'No se pudo crear la factura';
        Swal.fire('Error', mensaje, 'error');
      }
    });
  }

  private formatearFecha(fecha: Date | string): string {
    const d = new Date(fecha);
    return d.toISOString().split('T')[0];
  }

  // private formatearFecha(fecha: Date | string): string {
  //   const d = new Date(fecha);
  //   const year = d.getFullYear();
  //   const month = String(d.getMonth() + 1).padStart(2, '0');
  //   const day = String(d.getDate()).padStart(2, '0');
  //   return `${year}-${month}-${day}`;
  // }

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
    const clienteId = Number(this.form.getRawValue().clienteId);
    if (!clienteId) return;

    this.detalles.controls.forEach(ctrl => {
      const itemId = Number(ctrl.get('itemId')?.value);
      if (!itemId) return;

      this.precioService.obtenerPrecioParaCliente(itemId, clienteId).subscribe({
        next: precio => {
          const base = Number(precio.toFixed(2));
          ctrl.patchValue({
            precioUnitario: base,
            precioVisual: this.discriminaIVA
              ? base.toFixed(2)
              : (base * 1.21).toFixed(2)
          }, { emitEvent: false });
        },
        error: () => ctrl.patchValue({ precioUnitario: 0, precioVisual: '' }, { emitEvent: false })
      });
    });
  }

  private recalcularVisualesPorCambioIva(): void {
    this.detalles.controls.forEach(ctrl => {
      const base = Number(ctrl.get('precioUnitario')?.value || 0);
      const visual = this.discriminaIVA ? base : base * (1 + this.IVA);
      ctrl.get('precioVisual')?.setValue(visual.toFixed(2), { emitEvent: false });
    });
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}