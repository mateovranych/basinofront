export interface SesionActiva {
  refreshTokenId: string;
  
  // ID del usuario (GUID) para revocación masiva por usuario
  usuarioId: string;
  
  usuarioEmail: string;
  rol: string;
  
  // Las fechas se reciben como strings en formato ISO 8601 desde C#, pero las tipamos como Date.
  fechaInicio: Date;
  fechaExpiracion: Date; 
  
  ip: string; // IP desde la que se inició la sesión
  
  // Si la sesión está activa (true) o revocada (false).
  estadoSesion: boolean; 

  // Indica si esta sesión es la que está utilizando actualmente el administrador.
  esSesionActual?: boolean;

}