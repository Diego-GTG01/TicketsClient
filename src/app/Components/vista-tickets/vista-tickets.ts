import { Component, OnInit } from '@angular/core';
import { TicketService } from '../../Services/ticket-service';
import { Ticket } from '../../Interfaces/ticket';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../Services/auth-service';
import { Router } from '@angular/router';
import { Prioridad } from '../../Interfaces/prioridad';
import { EstadoTicket } from '../../Interfaces/estado-ticket';
import { FormsModule } from '@angular/forms';
import { PrioridadService } from '../../Services/prioridad-service';
import { EstadoService } from '../../Services/estado-service';

@Component({
  selector: 'app-vista-tickets',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vista-tickets.html',
  styleUrl: './vista-tickets.css',
})
export class VistaTickets implements OnInit {
  tickets: Ticket[] = [];
  ticketsFiltrados: Ticket[] = [];

  estados: EstadoTicket[] = [];
  prioridades: Prioridad[] = [];

  estadoFiltro: string = '';
  prioridadFiltro: string = '';
  miRol: string | null = null;
  token: string | null = null;
  username: string | null = null;
  idUsuario: number | null = null;

  constructor(
    private ticketService: TicketService,
    private estadoService: EstadoService,
    private prioridadService: PrioridadService,
    private authService: AuthService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.miRol = this.authService.getUserRol();
    this.token = this.authService.getToken();
    this.username = this.authService.getUsername();
    this.idUsuario = Number(this.authService.getIdUsuario());

    if ((this.miRol === 'Administrador')) {
      console.log('Cargando tickets para Administrador');
      this.ticketService.getAllTickets().subscribe({
        next: (result) => {
          this.tickets = result.objects;
          this.tickets.sort((a, b) => a.idTicket - b.idTicket);
          this.ticketsFiltrados = this.tickets;
        },
        error: (err) => {
          console.warn(err);
        },
      });
    }

    if ((this.miRol === 'Agente')) {
      console.log('Cargando tickets para Agente')
      this.ticketService.getAllTicketsByAgenteAsignado(Number(this.idUsuario)).subscribe({
        
        next: (result) => {
          this.tickets = result.objects;
          this.tickets.sort((a, b) => a.idTicket - b.idTicket);
          this.ticketsFiltrados = this.tickets;
        },
        error: (err) => {
          console.warn(err);
        },
      });
    }

    if ((this.miRol === 'Usuario')) {
      console.log('Cargando tickets para Usuario')
      this.ticketService.getAllTicketsByUsuarioSolicitado(Number(this.idUsuario)).subscribe({
        next: (result) => {
          this.tickets = result.objects;
          this.tickets.sort((a, b) => a.idTicket - b.idTicket);
          this.ticketsFiltrados = this.tickets;
        },
        error: (err) => {
          console.warn(err);
        },
      });
    }


    this.cargarEstado();
    this.cargarPrioridad();
  }

  cargarEstado(): void {
    this.estadoService.getAllEstados().subscribe({
      next: (result) => {
        if (result.correct) {
          this.estados = result.objects.flat();
        }
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
  cargarPrioridad(): void {
    this.prioridadService.getAll().subscribe({
      next: (result) => {
        if (result.correct) {
          this.prioridades = result.objects.flat();
        }
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  aplicarFiltros(): void {
    this.ticketsFiltrados = this.tickets.filter((ticket) => {
      const coincideEstado = !this.estadoFiltro || ticket.estado?.nombre === this.estadoFiltro;

      const coincidePrioridad =
        !this.prioridadFiltro || ticket.prioridad?.nombre === this.prioridadFiltro;

      return coincideEstado && coincidePrioridad;
    });
  }

  limpiarFiltros(): void {
    this.estadoFiltro = '';
    this.prioridadFiltro = '';

    this.ticketsFiltrados = [...this.tickets];
  }

  verDetalle(ticket: Ticket): void {
    localStorage.setItem('ticket', JSON.stringify(ticket));
    this.router.navigate(['/detail']);
  }

  irReporte(): void {
    this.router.navigate(['/report']);
  }
}
