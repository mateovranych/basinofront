export interface ItemParaPresupuesto {
    id: number;
    descripcion: string;

    presentacionDefault: {
        unidadComercial: string;  
        unidadBase: string;        
        factorConversion: number; 
        nombre?: string;         
    };
}