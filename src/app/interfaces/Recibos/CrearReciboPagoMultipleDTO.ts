import { ReciboPagoDetalleDTO } from "./ReciboPAgoDetalleDTO";

export interface CrearReciboPagoMultipleDTO {
  clienteId: number;
  observacion?: string;
  detalles: ReciboPagoDetalleDTO[];
}