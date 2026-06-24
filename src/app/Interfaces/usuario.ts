import { Rol } from './rol';

export interface Usuario {
  idUsuario: number;
  nombre?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  username?: string;
  password?: string;
  email?: string;
  telefono?: string;
  celular?: string;
  activo?: number;
  rol?: Rol;
}
