export interface MovimientoCuentaCorriente {
  id:number;
  fecha: string;
  concepto: string;
  debe: number;
  haber: number;
  saldo: number;
  presupuestoId?: number;
  facturaId?: number;
  reciboId?: number;
}
