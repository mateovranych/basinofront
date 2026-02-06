import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { CrearReciboPagoDTO } from "../interfaces/Recibos/CrearReciboPagoDTO";
import { CrearReciboPagoMultipleDTO } from "../interfaces/Recibos/CrearReciboPagoMultipleDTO";
import { ReciboListadoDTO } from "../interfaces/Recibos/ReciboListadoDTO";

@Injectable({
  providedIn: 'root'
})
export class RecibosService {

  private api = environment.apiUrl + '/Recibos';

  constructor(private http: HttpClient) { }

  crearReciboPago(dto: CrearReciboPagoDTO) {
    return this.http.post<{ reciboId: number }>(
      `${this.api}/crear`,
      dto
    );
  }

  crearReciboPagoMultiple(dto: CrearReciboPagoMultipleDTO) {
    return this.http.post<{ reciboId: number }>(
      `${this.api}/pagar-multiple`,
      dto
    );
  }

  obtenerPdf(reciboId: number) {
    return this.http.get(
      `${this.api}/pdf/${reciboId}`,
      { responseType: 'blob' }
    );
  }

  obtenerPorCliente(clienteId: number) {
    return this.http.get<ReciboListadoDTO[]>(`${this.api}/cliente/${clienteId}`);
  }



}
