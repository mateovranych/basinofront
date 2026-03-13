export interface CrearFacturaDetalleDTO {
    itemId: number;
    cantidadComercial: number;
    cantidadReal?: number;
    precioUnitario?: number;
    observaciones?: string;
}