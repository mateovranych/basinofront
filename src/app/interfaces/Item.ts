export interface Item {
    id: number;
    codigo: string;
    descripcion: string;
    precioVenta: number;
    precioCosto: number;
    precioLista1: number | null;   // 👈 corregido
    precioLista2: number | null;   // 👈 corregido
    esServicio: boolean;
    unidadMedidaId: number;
    unidadMedida: string;

    categoriaId?: number;
    categoriaNombre?: string;
    fechaVencimiento?: string;
    requiereFrio?: boolean;
}