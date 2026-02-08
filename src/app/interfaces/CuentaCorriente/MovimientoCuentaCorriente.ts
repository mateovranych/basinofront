export interface MovimientoCuentaCorriente {
  fecha: string;
  concepto: string;
  debe: number;
  haber: number;
  saldo: number;
  presupuestoId?: number;
  reciboId?: number;
}
