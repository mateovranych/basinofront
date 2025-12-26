export interface ItemMin {
  id: number;
  descripcion: string;
  unidadMedidaNombre: string; 
  presentacionDefault: null | {
    unidadComercial: string;
    unidadBase: string;
    factorConversion: number;
    nombre?: string;
  };
}
