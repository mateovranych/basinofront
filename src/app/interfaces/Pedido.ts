import { PedidoDetalle } from "./PedidoDetalle";

export interface Pedido {
  id: number;
  clienteId: number;
  clienteNombre: string;
  estadoId: number;
  estadoNombre: string;
  fecha: string;
  total: number;
  detalles: PedidoDetalle[];
}