export interface CrearItem {
    codigo: string;
    descripcion: string;
    precioVenta: number;
    esServicio: boolean;
    unidadMedida: string;
    categoriaId?: number;
    fechaVencimiento?: string;
    requiereFrio?: boolean;
}