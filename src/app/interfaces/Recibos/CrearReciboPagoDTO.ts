export interface CrearReciboPagoDTO {
  clienteId: number;
  monto: number;
  presupuestoId?: number | null;
  observacion?: string;
}