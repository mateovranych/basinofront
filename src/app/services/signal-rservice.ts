import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {

 
  private hub!: signalR.HubConnection;

  iniciar(): void {

    // 👇 si environment.apiUrl = https://localhost:7004/api
    const apiRoot = environment.apiUrl.replace(/\/api\/?$/, '');

    this.hub = new signalR.HubConnectionBuilder()
      .withUrl(`${apiRoot}/hub/bassino`, {
        withCredentials: true  // por si más adelante protegés el hub
      })
      .withAutomaticReconnect()
      .build();

    this.hub.start()
      .then(() => console.log("🔗 SignalR conectado"))
      .catch(err => console.error("❌ Error conectando SignalR", err));
  }

  listen(evento: string, callback: (data: any) => void): void {
    if (!this.hub) {
      console.error('⚠️ Hub no inicializado todavía');
      return;
    }

    this.hub.on(evento, (data) => {
      console.log("📩 Evento recibido:", evento, data);
      callback(data);
    });
  }
  
}
