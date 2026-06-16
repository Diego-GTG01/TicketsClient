import { EstadoTicket } from "./estado-ticket";
import { Prioridad } from "./prioridad";
import { Usuario } from "./usuario";

export interface Ticket {
    idTicket: number,
    titulo: string,
    descripcion: string,
    FechaCreacion?: Date,
    FechaActualizacion?: Date,
    usuarioSolicitante?: Usuario,
    agenteAsignado?: Usuario,
    prioridad?: Prioridad;
    estado?: EstadoTicket


}
