import { Component, OnInit } from '@angular/core';
import { TicketService } from '../../Services/ticket-service';
import { Ticket } from '../../Interfaces/ticket';

@Component({
  selector: 'app-vista-detalle-ticket',
  imports: [],
  templateUrl: './vista-detalle-ticket.html',
  styleUrl: './vista-detalle-ticket.css',
})
export class VistaDetalleTicket implements OnInit {
  constructor(private ticketService: TicketService) {}
  ngOnInit(): void {
    localStorage.getItem('idTicket');
    this.ticketService.getById(1).subscribe({
      next: (result) => {
        this.ticket = result.object;
        console.log(this.ticket);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
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

  comentarios: any[] = [];

  historial: any[] = [];
}
