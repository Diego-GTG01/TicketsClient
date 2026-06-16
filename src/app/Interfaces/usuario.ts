import { Rol } from './rol';

export interface Usuario {
  idUsuario: number;
  nombre?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  username?: string;
  email?: string;
  telefono?: string;
  celular?: string;
  activo?: number;
  rol?: Rol;
}
