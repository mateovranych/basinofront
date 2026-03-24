import { CrearFacturaDetalleDTO } from "./CrearFacturaDetalleDTO";

export interface CrearFacturaDTO {
    clienteId: number;
    tipoComprobanteId: number;
    // puntoVenta: number;
    concepto: number;
    presupuestoId?: number;
    forzarNoDiscriminarIVA?: boolean;
    fechaServicioDesde?: string;
    fechaServicioHasta?: string;
    fechaVencimientoPago: string;
    detalles: CrearFacturaDetalleDTO[];
}