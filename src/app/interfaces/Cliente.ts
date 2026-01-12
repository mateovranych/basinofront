export interface Cliente {
  id: number;

  razonSocial: string;
  alias: string;

  cuit: string;
  domicilio: string;
  telefono: string;
  email: string;

  tieneCuentaCorriente: boolean;

  condicionIVA: string;
  condicionIvaId: number;

  listaPrecioId: number;
  listaPrecioNombre?: string;

  localidadId?: number;
  localidadNombre?: string;

  provinciaId?: number;
  provinciaNombre?: string;

  esActivo: boolean;
}
