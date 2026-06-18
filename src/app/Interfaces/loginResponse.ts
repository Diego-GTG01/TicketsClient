import { Rol } from './rol';

export interface LoginResponse {
  token: string;
  username?: string;
  rol?: Rol;
  idUsuario?: number;
}
