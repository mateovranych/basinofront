export interface Item {
    id: number;
    codigo: string;
    descripcion: string;
    esServicio: boolean;
    unidadMedidaId: number;
    unidadMedida: string;
    habilitado:boolean;
    categoriaId?: number;
    categoriaNombre?: string;    
    requiereFrio?: boolean;
}