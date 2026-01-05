export interface ItemMin {
  id: number;
  codigo:string;
  descripcion: string;
  esServicio: boolean;
  unidadMedidaNombre: string; 
  presentacionDefault: null | {
    unidadComercial: string;
    unidadBase: string;
    factorConversion: number;
    nombre?: string;
  };
}
