export interface CrearItem {
    codigo: string;
    descripcion: string;
    esServicio: boolean;

    unidadMedidaId: number;
    unidadBaseId: number;     

    factorConversion: number; 

    proveedorId: number; // 👈 CLAVE
    
    categoriaId?: number | null;
    requiereFrio?: boolean;
    habilitado: boolean;
}