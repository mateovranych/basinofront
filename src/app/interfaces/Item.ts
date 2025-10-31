export interface Item {
    id: number;
    codigo: string;
    descripcion: string;
    precioVenta: number;
    esServicio: boolean;
    unidadMedida: string;
    categoriaNombre?: string;
    categoriaId?: number;
    fechaVencimiento?: string;
    requiereFrio?: boolean;
}