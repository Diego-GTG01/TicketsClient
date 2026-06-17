import { Component, OnInit } from '@angular/core';
import { TicketService } from '../../Services/ticket-service';
import { Ticket } from '../../Interfaces/ticket';
import { ComentarioService } from '../../Services/comentario-service';
import { Comentario } from '../../Interfaces/comentario';
import { DatePipe } from '@angular/common';
import { Historial } from '../../Interfaces/historial';
import { HistorialService } from '../../Services/historial-service';

@Component({
  selector: 'app-vista-detalle-ticket',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './vista-detalle-ticket.html',
  styleUrl: './vista-detalle-ticket.css',
})
export class VistaDetalleTicket implements OnInit {
  ticket: Ticket = {
    idTicket: 0,
    titulo: '',
    descripcion: '',
    FechaCreacion: undefined,
    FechaActualizacion: undefined,

    usuarioSolicitante: {
      idUsuario: 0,
      nombre: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      username: '',
      email: '',
      telefono: '',
      celular: '',
      activo: 0,
      rol: {
        idRol: 0,
        nombre: '',
        descripcion: '',
      },
    },

    agenteAsignado: {
      idUsuario: 0,
      nombre: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      username: '',
      email: '',
      telefono: '',
      celular: '',
      activo: 0,
      rol: {
        idRol: 0,
        nombre: '',
        descripcion: '',
      },
    },

    prioridad: {
      idPrioridad: 0,
      nombre: '',
    },

    estado: {
      idEstado: 0,
      nombre: '',
    },
  };

  comentarios: Comentario[] = [];

  historial: Historial[] = [];

  constructor(
    private ticketService: TicketService,
    private comentarioService: ComentarioService,
    private historialService: HistorialService
  ) {}

  ngOnInit(): void {
    localStorage.getItem('idTicket');
    this.ticketService.getById(3).subscribe({
      next: (result) => {
        this.ticket = result.object;
        console.log(this.ticket);
        this.comentarioService.getComentarioByIdTicket(this.ticket.idTicket).subscribe({
          next: (result) => {
            this.comentarios = result.objects;
            console.log(this.comentarios);
          },
          error: (err) => {
            console.error(err);
          },
        });
        this.historialService.getHistorialById(this.ticket.idTicket).subscribe({
          next: (result) => {
            this.historial = result.objects;
          },
          error: (err) => {
            console.error(err);
          },
        });
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
}
