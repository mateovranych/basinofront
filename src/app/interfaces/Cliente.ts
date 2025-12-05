export interface Cliente {
    id: number;
    razonSocial: string;
    cuit: string;
    domicilio: string;
    telefono: string;
    email: string;

    tieneCuentaCorriente: boolean;

    condicionIVA: string;
    condicionIvaId: number;
    
    listaPrecioId: number;
    listaPrecioNombre?: string;
    
    esActivo: boolean;
    
}