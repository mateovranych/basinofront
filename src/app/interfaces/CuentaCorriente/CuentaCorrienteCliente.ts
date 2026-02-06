import { PresupuestoCC } from "./PresupuestoCC";

export interface CuentaCorrienteCliente {
  clienteId: number;
  clienteNombre: string;
  saldoTotal: number;
  presupuestos: PresupuestoCC[];
}