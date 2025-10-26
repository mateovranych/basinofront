import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; // 🔑 Nuevo Import

import { SesionesService } from '../../services/sesiones-service';
import { AuthService } from '../../services/auth-service'; 
import { SesionActiva } from '../../interfaces/SesionActiva';

@Component({
  selector: 'app-sesiones',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatSnackBarModule, // 🔑 Nuevo Import
    FormsModule
  ],
  templateUrl: './sesiones.html',
  styleUrl: './sesiones.scss'
})
export class Sesiones implements OnInit {

  displayedColumns: string[] = [
    'usuarioEmail',
    'rol',
    'fechaInicio',
    'fechaExpiracion',
    'ip',
    'acciones'
  ];
  dataSource = new MatTableDataSource<SesionActiva>([]);
  cargando = false;

  constructor(
    private sesionesService: SesionesService, 
    private authService: AuthService, 
    private snackBar: MatSnackBar // 🔑 Nuevo
  ) { }

  ngOnInit(): void {
    this.cargarSesiones();
    setInterval(() => this.cargarSesiones(), 30000); 
  }

  /**
   * Muestra una notificación usando MatSnackBar.
   */
  private mostrarNotificacion(mensaje: string, duracion: number = 3000): void {
      this.snackBar.open(mensaje, 'Cerrar', {
          duration: duracion,
          verticalPosition: 'top',
          horizontalPosition: 'end'
      });
  }

  cargarSesiones(): void {
    this.cargando = true;
    this.sesionesService.getAll().subscribe({
      next: (res) => {
        // Mapeamos para garantizar que las fechas sean objetos Date si es necesario
        this.dataSource.data = res.map(s => ({
            ...s,
            fechaInicio: new Date(s.fechaInicio), 
            fechaExpiracion: new Date(s.fechaExpiracion),
            estadoSesion: s.estadoSesion // Asumimos que el backend envía el estado correcto
        }));
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar sesiones:', err);
        this.mostrarNotificacion('Error: No se pudieron cargar las sesiones.', 5000);
        this.cargando = false;
      },
    });
  }


  revoke(refreshTokenId: string): void {
    if (!window.confirm('¿Cerrar esta sesión? Se cerrará inmediatamente esta sesión activa.')) {
        return;
    }

    this.sesionesService.revoke(refreshTokenId).subscribe({
      next: () => {
        this.mostrarNotificacion('La sesión fue revocada exitosamente.');
        this.cargarSesiones();
      },
      error: (err) => {
        console.error('Error al revocar sesión:', err);
        this.mostrarNotificacion('Error: No se pudo revocar la sesión.', 5000);
      },
    });
  }

  /**
   * Revoca TODAS las sesiones del usuario actual (Admin) que usa esta interfaz.
   */
  revokeAll(): void {
    const adminUserId = this.authService.getUserId(); 

    if (!adminUserId) {
        this.mostrarNotificacion('No se pudo identificar al administrador para cerrar sus sesiones.', 5000);
        return;
    }

    if (!window.confirm('ADVERTENCIA: ¿Cerrar TODAS mis sesiones? Serás desconectado de todos tus dispositivos (excepto el actual).')) {
        return;
    }

    this.sesionesService.revokeAllForUser(adminUserId).subscribe({
      next: () => {
        this.mostrarNotificacion('Todas tus sesiones fueron cerradas con éxito.');
        this.cargarSesiones();
      },
      error: (err) => {
        console.error('Error al revocar todas las sesiones:', err);
        this.mostrarNotificacion('Error: No se pudieron cerrar todas las sesiones.', 5000);
      },
    });
  }

   reactivarSesion(refreshTokenId: string): void {
    this.authService.reactivarSesion(refreshTokenId).subscribe({
      next: (response) => {
        this.snackBar.open('Sesión reactivada exitosamente', 'Cerrar', { duration: 3000 });
        this.cargarSesiones();  // Recargamos las sesiones para reflejar los cambios
      },
      error: (error) => {
        this.snackBar.open('Error al reactivar la sesión', 'Cerrar', { duration: 3000 });
      }
    });
  }

  /**
   * Método para cambiar el estado de la sesión usando el MatSlideToggle.
   */
  onSessionStateChange(refreshTokenId: string, currentState: boolean, newChecked: boolean): void {
    if (currentState === true && newChecked === false) {
      // Revocar la sesión si está activa
      this.revoke(refreshTokenId);
    } else if (currentState === false && newChecked === true) {
      // Lógica de reactivación (no implementada)
      this.mostrarNotificacion('La reactivación de sesiones revocadas no está implementada en el backend.');
      // Forzar la recarga para que el slide-toggle vuelva a su estado original
      this.cargarSesiones();
    }
  }
}
