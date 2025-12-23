export interface PresupuestoDetalleDTO {
    itemId: number;

    cantidadComercial: number; 
    cantidadReal?: number;    

    precioUnitario?: number;
}