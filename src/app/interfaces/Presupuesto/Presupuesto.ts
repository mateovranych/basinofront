import { PresupuestoDetalle } from "./PresupuestoDetalle";

export interface Presupuesto {
  id: number;
  clienteId: number;
  clienteNombre: string;
  fecha: string;
  total: number;
  detalles: PresupuestoDetalle[];
}
