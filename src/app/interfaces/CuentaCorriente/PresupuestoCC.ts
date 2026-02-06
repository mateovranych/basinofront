export interface PresupuestoCC {
  presupuestoId: number;
  fecha: string;
  monto: number;
  pagos: number;
  saldo: number;
  observacion?: string;

  // frontend only
  seleccionado?: boolean;
  montoPago?: number;
}
