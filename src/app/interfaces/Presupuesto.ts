export interface Presupuesto {
  id: number;
  clienteId: number;
  clienteNombre: string;
  fecha: string;
  total: number;
  detalles: {
    itemId: number;
    itemDescripcion: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
  }[];
}
