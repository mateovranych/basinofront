import { Item } from "./Item";
import { PrecioConListaDTO } from "./PrecioConListaDTO";

export interface ItemConPrecios extends Item {
    precios: PrecioConListaDTO[];
}