import { Usuario } from './usuario';

export interface VerificacionToken {
  idToken: number;
  token: string;
  usuarioToken: Usuario;
  fechaExpiracion: Date;
}
