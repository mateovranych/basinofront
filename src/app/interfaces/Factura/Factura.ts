import { FacturaDetalle } from "./FacturaDetalle";

export interface Factura{
     id: number;
  clienteId: number;
  clienteNombre: string;
  clienteAlias: string;
  cuit: string;
  clienteCategoria: string;
  direccion: string;
  tipoComprobanteId: number;
  tipoComprobanteNombre: string;
  codigoAfipComprobante: number;
  puntoVenta: number;
  numeroComprobante: number;
  concepto: number;
  condicionIVACodigoAfip: string;
  discriminaIVA: boolean;
  fechaEmision: string;
  fechaServicioDesde?: string;
  fechaServicioHasta?: string;
  fechaVencimientoPago: string;
  subtotal: number;
  iva: number;
  total: number;
  cae?: string;
  caeFechaVencimiento?: string;
  autorizadaEnARCA: boolean;
  arcaMensajeError?: string;
  presupuestoId?: number;
  detalles: FacturaDetalle[];
}