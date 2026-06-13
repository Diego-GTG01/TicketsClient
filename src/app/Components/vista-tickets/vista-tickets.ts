import { Component, OnInit } from '@angular/core';
import { TicketService } from '../../Services/ticket-service';
import { Ticket } from '../../Interfaces/ticket';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-vista-tickets',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vista-tickets.html',
  styleUrl: './vista-tickets.css',
})
export class VistaTickets implements OnInit {
  tickets: Ticket[] = [];

  constructor(private ticketService: TicketService) {}

  ngOnInit(): void {
    this.ticketService.getAllTickets().subscribe({
      next: (result) => {
        this.tickets = result.objects;
        console.log(this.tickets);
      },
      error: (err) => {
        console.warn(err);
      },
    });
  }

  verDetalleYComentarios(ticket: Ticket): void {
    console.log('Abriendo detalle del ticket:', ticket.idTicket);
  }

  asignarTicketA_Mi(idTicket: number): void {
    console.log(`Asignando el ticket ${idTicket} al agente actual`);
  }

  cambiarEstado(idTicket: number, event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const nuevoEstadoId = Number(selectElement.value);

    console.log(`Cambiando ticket ${idTicket} al estado ID: ${nuevoEstadoId}`);
  }
}
