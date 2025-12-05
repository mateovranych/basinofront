export interface PresupuestoDetalle {
  itemId: number;
  itemDescripcion: string;
  cantidad: number;
  precioUnitario: number;  // viene desde backend
  subtotal: number;
}