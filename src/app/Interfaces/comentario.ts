import { Ticket } from "./ticket";
import { Usuario } from "./usuario";

export interface Comentario {
    idComentario: number,
    ticket: Ticket,
    usuario: Usuario,
    mensaje: string,
    Fecha: Date
    
}
