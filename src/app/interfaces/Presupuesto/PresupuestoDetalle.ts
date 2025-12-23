export interface PresupuestoDetalle {
  itemId: number;
  itemDescripcion: string;

  cantidadComercial: number;
  cantidad: number; 

  precioUnitario: number;
  subtotal: number;
}