export interface CrearItem {
    codigo: string;
    descripcion: string;
    esServicio: boolean;

    unidadMedidaId: number;
    unidadBaseId: number;     // KG, UNIDAD, LITRO

    factorConversion: number; // 3, 12, 24, etc
    
    categoriaId?: number | null;
    requiereFrio?: boolean;
    habilitado: boolean;
}