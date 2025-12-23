export interface ItemMin {
  id: number;
  descripcion: string;
  unidadMedidaNombre: string; // Esto sería el nombre de la unidad de medida, como 'kg' o 'UN'.
  presentacionDefault: null | {
    unidadComercial: string;
    unidadBase: string;
    factorConversion: number;
    nombre?: string;
  };
}
