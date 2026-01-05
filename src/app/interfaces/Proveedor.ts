export interface Proveedor {

    id: number;
    razonSocial: string;
    cuit: string;
    domicilio: string;
    telefono: string;
    email: string;
    condicionIvaId: number;
    condicionIVA?: string;
    esActivo: boolean;
    
}