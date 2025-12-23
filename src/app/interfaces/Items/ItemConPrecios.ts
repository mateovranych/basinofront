import { ConfiguracionDePrecioDTO } from "../ConfiguracionDePrecioDTO";

import { PrecioConListaDTO } from "../PrecioConListaDTO";

export interface ItemConPrecios  {
    id: number;
    codigo: string;
    descripcion: string;
    precios: PrecioConListaDTO[];
    configs: ConfiguracionDePrecioDTO[];
}