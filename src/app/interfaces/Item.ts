export interface Item {
    id: number;
    codigo: string;
    descripcion: string;
    esServicio: boolean;
    unidadMedidaId: number;
    unidadMedida: string;

    categoriaId?: number;
    categoriaNombre?: string;    
    requiereFrio?: boolean;
}