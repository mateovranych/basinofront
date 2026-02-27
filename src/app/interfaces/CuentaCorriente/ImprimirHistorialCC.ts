export interface ImprimirHistorialCC{
      clienteId: number;
  desde?: string | null;        // "YYYY-MM-DD"
  hasta?: string | null;        // "YYYY-MM-DD"
  movimientoIds?: number[];     // si imprimís selección
}