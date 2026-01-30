export interface ValidacionEliminarPresupuesto {
    puedeEliminar: boolean;
    tieneMovimientos: boolean;
    mensaje?: string;
}