import { Rol } from './rol';

export interface LoginResponse {
  token: string;
  username: string;
  rol: string;
  idUsuario?: number;
}
