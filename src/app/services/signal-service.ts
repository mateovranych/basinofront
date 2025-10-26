import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { AuthService } from './auth-service';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class SignalService {

  private connection: HubConnection | null = null;
  private readonly hubUrl = 'https://localhost:7004/hub';

  constructor(private auth: AuthService, private router: Router) {}

  startConnection(): void {
    if (this.connection) return; 

    this.connection = new HubConnectionBuilder()
      .withUrl(this.hubUrl)
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    this.connection.start()
      .then(() => console.log('✅ SignalR conectado'))
      .catch(err => console.error('❌ Error al conectar SignalR:', err));

    this.connection.on('ForceLogout', () => {
      console.log('🚫 Sesión revocada por el admin.');
      this.auth.logout();
      this.router.navigate(['/login']);
    });
  }

  stopConnection(): void {
    this.connection?.stop().catch(err => console.error('Error al detener SignalR:', err));
  }
}
