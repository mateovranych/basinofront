import { ReciboPagoDetalleDTO } from "./ReciboPAgoDetalleDTO";

export interface CrearReciboPagoMultipleDTO {
  clienteId: number;
  observacion?: string;
  fecha?: string; 
  detalles: ReciboPagoDetalleDTO[];
}