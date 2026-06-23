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
import { UserBadgeComponent } from '../user-badge-component/user-badge-component';
import { AgentService } from '../../Services/agent-service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-vista-tickets',
  standalone: true,
  imports: [CommonModule, FormsModule, UserBadgeComponent],
  templateUrl: './vista-tickets.html',
  styleUrl: './vista-tickets.css',
})
export class VistaTickets implements OnInit {
  tickets: Ticket[] = [];
  ticketsFiltrados: Ticket[] = [];
  estados: EstadoTicket[] = [];
  prioridades: Prioridad[] = [];
  agentesDisponibles: any[] = [];

  estadoFiltro: string = '';
  prioridadFiltro: string = '';
  miRol: string | null = null;
  token: string | null = null;
  username: string | null = null;
  idUsuario: number | null = null;
  usuarioSesion: any;
  tabActiva: number = 1;

  constructor(
    private ticketService: TicketService,
    private estadoService: EstadoService,
    private prioridadService: PrioridadService,
    private authService: AuthService,
    private agentService: AgentService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.miRol = this.authService.getUserRol();
    this.token = this.authService.getToken();
    this.username = this.authService.getUsername();
    this.idUsuario = Number(this.authService.getIdUsuario());
    this.usuarioSesion = { nombre: this.username, rol: this.miRol };

    this.cargarTickets();
    this.cargarEstado();
    this.cargarPrioridad();
  }

  cargarTickets(): void {
    const idNum = Number(this.idUsuario);

    if (this.miRol === 'Administrador') {
      console.log('Cargando todos los tickets para Administrador');
      this.cargarAgentes();
      this.ticketService.getAllTickets().subscribe({
        next: (result) => {
          this.tickets = result.objects || [];
          this.tickets.sort((a, b) => a.idTicket - b.idTicket);
          this.actualizarTicketsPorTab();
        },
        error: (err) => console.warn(err),
      });
    } else if (this.miRol === 'Agente') {
      console.log('Cargando tickets para Agente');
      this.ticketService.getAllTicketsByAgenteAsignado(idNum).subscribe({
        next: (result) => {
          this.tickets = result.objects || [];
          this.tickets.sort((a, b) => a.idTicket - b.idTicket);
          this.ticketsFiltrados = [...this.tickets];
        },
        error: (err) => console.warn(err),
      });
    } else if (this.miRol === 'Usuario') {
      console.log('Cargando tickets para Usuario');
      this.ticketService.getAllTicketsByUsuarioSolicitado(idNum).subscribe({
        next: (result) => {
          this.tickets = result.objects || [];
          this.tickets.sort((a, b) => a.idTicket - b.idTicket);
          this.ticketsFiltrados = [...this.tickets];
        },
        error: (err) => console.warn(err),
      });
    }
  }

  cambiarTab(tab: number): void {
    this.tabActiva = tab;
    this.limpiarFiltros();
    this.actualizarTicketsPorTab();
  }

  actualizarTicketsPorTab(): void {
    if (this.miRol !== 'Administrador') return;

    this.ticketsFiltrados = this.tickets.filter((ticket) => {
      if (this.tabActiva === 1) return ticket.status === 1;
      if (this.tabActiva === 2) return ticket.status === 2;
      if (this.tabActiva === 3) return ticket.status === 3;
      return true;
    });
  }

  cargarAgentes(): void {
    this.agentService.getAllUsers('Agente').subscribe({
      next: (result) => {
        this.agentesDisponibles = result.objects || [];
      },
      error: (error) => console.error(error),
    });
  }

  aceptarTicket(ticket: Ticket): void {
    console.log('Iniciando proceso de aceptación para el ticket:', ticket.idTicket);

    const opcionesAgentes: { [key: string]: string } = {};
    this.agentesDisponibles.forEach((agente) => {
      opcionesAgentes[agente.idUsuario] = agente.username;
    });

    Swal.fire({
      title: 'Asignar Agente Técnico',
      text: 'Selecciona el encargado para atender este ticket',
      input: 'select',
      inputOptions: opcionesAgentes,
      inputPlaceholder: 'Selecciona un agente...',
      showCancelButton: true,
      confirmButtonText: 'Aceptar y Asignar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#0d6efd',
      cancelButtonColor: '#6c757d',
      inputValidator: (value) => {
        if (!value) return 'Debes seleccionar un agente técnico';
        return null;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const idAgenteSeleccionado = Number(result.value);
        
        // Ejecución Secuencial: Primero cambia el estado a 2 (Aceptado)
        this.ticketService.updateStatus(ticket.idTicket, 2).subscribe({
          next: (statusResult) => {
            if (statusResult.correct) {
              // Si el estado cambió bien, ahora asigna al agente
              this.ticketService.updateAgente(ticket.idTicket, idAgenteSeleccionado).subscribe({
                next: (agentResult) => {
                  if (agentResult.correct) {
                    Swal.fire('¡Asignado!', 'El ticket fue aceptado y el agente asignado con éxito.', 'success');
                    this.cargarTickets();
                  } else {
                    Swal.fire('Aviso', 'El ticket cambió de estado, pero no se pudo asignar al agente.', 'warning');
                  }
                },
                error: (err) => {
                  console.error(err);
                  Swal.fire('Error', 'Ocurrió un problema al asignar el agente.', 'error');
                }
              });
            } else {
              Swal.fire('Error', 'No se pudo cambiar el estado del ticket.', 'error');
            }
          },
          error: (err) => console.warn(err)
        });
      }
    });
  }

  rechazarTicket(ticket: Ticket): void {
    console.log('Ticket rechazado:', ticket.idTicket);
    this.ticketService.updateStatus(ticket.idTicket, 3).subscribe({
      next: (result) => {
        if (result.correct) {
          Swal.fire('¡Rechazado!', 'El ticket ha sido rechazado con éxito.', 'success');
          this.cargarTickets();
        } else {
          Swal.fire('Error', 'No se pudo rechazar el ticket.', 'error');
        }
      },
      error: (err) => console.warn(err)
    });
  }

  cargarEstado(): void {
    this.estadoService.getAllEstados().subscribe({
      next: (result) => {
        if (result.correct) {
          this.estados = result.objects.flat();
        }
      },
      error: (err) => console.error(err),
    });
  }

  cargarPrioridad(): void {
    this.prioridadService.getAll().subscribe({
      next: (result) => {
        if (result.correct) {
          this.prioridades = result.objects.flat();
        }
      },
      error: (err) => console.error(err),
    });
  }

  aplicarFiltros(): void {
    let baseTickets =
      this.miRol === 'Administrador'
        ? this.tickets.filter((t) => t.estado?.nombre === 'Aceptado')
        : this.tickets;

    this.ticketsFiltrados = baseTickets.filter((ticket) => {
      const coincideEstado = !this.estadoFiltro || ticket.estado?.nombre === this.estadoFiltro;
      const coincidePrioridad = !this.prioridadFiltro || ticket.prioridad?.nombre === this.prioridadFiltro;
      return coincideEstado && coincidePrioridad;
    });
  }

  limpiarFiltros(): void {
    this.estadoFiltro = '';
    this.prioridadFiltro = '';

    if (this.miRol === 'Administrador') {
      this.actualizarTicketsPorTab();
    } else {
      this.ticketsFiltrados = [...this.tickets];
    }
  }

  verDetalle(ticket: Ticket): void {
    localStorage.setItem('ticket', JSON.stringify(ticket));
    this.router.navigate(['/detail']);
  }

  irReporte(): void {
    this.router.navigate(['/report']);
  }
}