export interface FacturaDetalle {
    itemId: number;
    codigo: string;
    itemDescripcion: string;
    esServicio: boolean;
    cantidadComercial: number;
    cantidad: number;
    precioUnitario: number;
    alicuotaIVA: number;
    observaciones?: string;
    unidadComercial?: string;
    unidadBase?: string;
}