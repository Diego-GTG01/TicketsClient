import { EstadoTicket } from "./estado-ticket";
import { Ticket } from "./ticket";
import { Usuario } from "./usuario";

export interface Historial {
    idHistorial: number,
    ticket: Ticket,
    estadoAnterior: EstadoTicket,
    estadoActual: EstadoTicket,
    usuario: Usuario,
    fechaActualizaciion: Date


    
}
