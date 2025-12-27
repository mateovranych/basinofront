export interface ItemMin {
  id: number;
  codigo:string;
  descripcion: string;
  unidadMedidaNombre: string; 
  presentacionDefault: null | {
    unidadComercial: string;
    unidadBase: string;
    factorConversion: number;
    nombre?: string;
  };
}
