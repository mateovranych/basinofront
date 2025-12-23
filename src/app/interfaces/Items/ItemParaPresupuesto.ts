export interface ItemParaPresupuesto {
    id: number;
    descripcion: string;

    presentacionDefault: {
        unidadComercial: string;   // HORMA, CAJA
        unidadBase: string;        // KG, UN
        factorConversion: number; // 3.0, 12, 24
        nombre?: string;           // "Horma x 3kg"
    };
}