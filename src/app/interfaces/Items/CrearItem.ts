export interface CrearItem {
    codigo: string;
    descripcion: string;
    esServicio: boolean;

    unidadMedidaId: number;
    unidadBaseId: number;     

    factorConversion: number; 
    
    categoriaId?: number | null;
    requiereFrio?: boolean;
    habilitado: boolean;
}