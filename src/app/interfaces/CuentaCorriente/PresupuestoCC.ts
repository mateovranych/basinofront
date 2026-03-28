export interface PresupuestoCC {
  presupuestoId?: number | null;
  facturaId?: number | null;
  fecha: string;
  monto: number;
  pagos: number;
  saldo: number;
  observacion?: string;

  // frontend only
  seleccionado?: boolean;
  montoPago?: number;
}
