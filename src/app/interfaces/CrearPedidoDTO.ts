export interface CrearPedidoDTO {
  clienteId: number;
  estadoId: number;
  detalles: { itemId: number; cantidad: number; precioUnitario: number }[];
}