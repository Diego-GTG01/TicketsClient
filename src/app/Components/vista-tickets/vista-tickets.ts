import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, switchMap, takeUntil } from 'rxjs';

import { TicketService } from '../../Services/ticket-service';
import { AuthService } from '../../Services/auth-service';
import { PrioridadService } from '../../Services/prioridad-service';
import { EstadoService } from '../../Services/estado-service';
import { UserService } from '../../Services/user-service';

import { Ticket } from '../../Interfaces/ticket';
import { Prioridad } from '../../Interfaces/prioridad';
import { EstadoTicket } from '../../Interfaces/estado-ticket';
import { UserBadgeComponent } from '../user-badge-component/user-badge-component';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-vista-tickets',
  standalone: true,
  imports: [CommonModule, FormsModule, UserBadgeComponent],
  templateUrl: './vista-tickets.html',
  styleUrl: './vista-tickets.css',
})
export class VistaTickets implements OnInit, OnDestroy {
  tickets: Ticket[] = [];
  ticketsFiltrados: Ticket[] = [];
  estados: EstadoTicket[] = [];
  prioridades: Prioridad[] = [];
  agentesDisponibles: any[] = [];

  estadoFiltro = '';
  prioridadFiltro = '';
  miRol: string | null = null;
  idUsuario: number | null = null;
  tabActiva = 1;

  usuarioSesion: any;
  username: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private ticketService: TicketService,
    private estadoService: EstadoService,
    private prioridadService: PrioridadService,
    private authService: AuthService,
    private agentService: UserService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.authService.logout();
      return;
    }

    this.miRol = this.authService.getUserRol();
    this.idUsuario = Number(this.authService.getIdUsuario());
    this.username = this.authService.getUsername();

    this.usuarioSesion = { nombre: this.username, rol: this.miRol };

    this.cargarTickets();
    this.cargarEstadosYPrioridades();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarTickets(): void {
    const idNum = Number(this.idUsuario);
    let request$ = this.ticketService.getAllTickets();

    if (this.miRol === 'Administrador') {
      this.cargarAgentes();
    } else if (this.miRol === 'Agente') {
      request$ = this.ticketService.getAllTicketsByAgenteAsignado(idNum);
    } else if (this.miRol === 'Usuario') {
      request$ = this.ticketService.getAllTicketsByUsuarioSolicitado(idNum);
    }

    request$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (result) => {
        if (result.correct) {
          this.tickets = result.objects || [];
          this.tickets.sort((a, b) => a.idTicket - b.idTicket);

          if (this.miRol === 'Administrador') {
            this.actualizarTicketsPorTab();
          } else {
            this.ticketsFiltrados = [...this.tickets];
          }
        }
      },
      error: (err) => {
        console.warn('Error al cargar tickets:', err);
        if (err.status === 403) {
          Swal.fire({
            icon: 'error',
            title: 'Sesión expirada',
            text: 'Su sesión ha expirado. Por favor, inicie sesión nuevamente.',
            confirmButtonColor: '#3085d6',
          }).then(() => {
            this.authService.logout();
          });
        }
        if (err.status !== 400 && err.status !== 404) {
          Swal.fire({
            icon: 'error',
            title: 'Error de conexión',
            text: 'No se pudo conectar con el servidor.',
            confirmButtonColor: '#3085d6',
          });
        }
      },
    });
  }

  cambiarTab(tab: number): void {
    this.tabActiva = tab;
    this.limpiarFiltros();
  }

  actualizarTicketsPorTab(): void {
    if (this.miRol !== 'Administrador') return;

    this.ticketsFiltrados = this.tickets.filter((ticket) => ticket.status === this.tabActiva);
  }

  cargarAgentes(): void {
    this.agentService
      .getAllUsersByRol('Agente')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => (this.agentesDisponibles = result.objects || []),
        error: (err) => {
          console.error('Error al cargar agentes:', err);
          if (err.status === 403) {
            Swal.fire({
              icon: 'error',
              title: 'Sesión expirada',
              text: 'Su sesión ha expirado. Por favor, inicie sesión nuevamente.',
              confirmButtonColor: '#3085d6',
            }).then(() => {
              this.authService.logout();
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error de conexión',
              text: 'No se pudo conectar con el servidor.',
              confirmButtonColor: '#3085d6',
            });
          }
        },
      });
  }

  aceptarTicket(ticket: Ticket): void {
    const opcionesAgentes = this.agentesDisponibles.reduce(
      (acc, agente) => {
        acc[agente.idUsuario] = agente.username;
        return acc;
      },
      {} as { [key: string]: string },
    );

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
      reverseButtons: true,
      inputValidator: (value) => (!value ? 'Debes seleccionar un agente técnico' : null),
    }).then((result) => {
      if (!result.isConfirmed) return;

      const idAgenteSeleccionado = Number(result.value);

      this.ticketService
        .updateStatus(ticket.idTicket, 2)
        .pipe(
          switchMap((statusResult) => {
            if (!statusResult.correct) {
              throw new Error('STATUS_ERROR');
            }
            return this.ticketService.updateAgente(ticket.idTicket, idAgenteSeleccionado);
          }),
          takeUntil(this.destroy$),
        )
        .subscribe({
          next: (agentResult) => {
            if (agentResult.correct) {
              Swal.fire(
                '¡Asignado!',
                'El ticket fue aceptado y el agente asignado con éxito.',
                'success',
              );
              this.cargarTickets();
            } else {
              Swal.fire(
                'Aviso',
                'El ticket cambió de estado, pero no se pudo asignar al agente.',
                'warning',
              );
            }
          },
          error: (err) => {
            console.error(err);
            const msg =
              err.message === 'STATUS_ERROR'
                ? 'No se pudo cambiar el estado del ticket.'
                : 'Ocurrió un problema al asignar el agente.';
            Swal.fire('Error', msg, 'error');
          },
        });
    });
  }

  rechazarTicket(ticket: Ticket): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Realmente deseas rechazar el ticket #${ticket.idTicket}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, rechazar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.ticketService
        .updateStatus(ticket.idTicket, 3)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res) => {
            if (res.correct) {
              Swal.fire('¡Rechazado!', 'El ticket ha sido rechazado con éxito.', 'success');
              this.cargarTickets();
            } else {
              Swal.fire('Error', 'No se pudo rechazar el ticket.', 'error');
            }
          },
          error: (err) => {
            console.warn(err);
            Swal.fire('Error', 'Ocurrió un error inesperado en el servidor.', 'error');
          },
        });
    });
  }

  private cargarEstadosYPrioridades(): void {
    this.estadoService
      .getAllEstados()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => (this.estados = res.correct ? res.objects.flat() : []),
        error: (err) => console.error(err),
      });

    this.prioridadService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => (this.prioridades = res.correct ? res.objects.flat() : []),
        error: (err) => console.error(err),
      });
  }

  aplicarFiltros(): void {
    const baseTickets =
      this.miRol === 'Administrador'
        ? this.tickets.filter((t) => t.estado?.nombre === 'Aceptado')
        : this.tickets;

    this.ticketsFiltrados = baseTickets.filter((ticket) => {
      const coincideEstado = !this.estadoFiltro || ticket.estado?.nombre === this.estadoFiltro;
      const coincidePrioridad =
        !this.prioridadFiltro || ticket.prioridad?.nombre === this.prioridadFiltro;
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
    if (ticket.status === 1) {
      Swal.fire('Oops', 'El Ticket seleccionado aún no ha sido aprobado', 'error');
    } else if (ticket.status === 3) {
      Swal.fire('Oops', 'El Ticket seleccionado fue descartado', 'error');
    } else {
      localStorage.setItem('ticket', JSON.stringify(ticket));
      this.router.navigate(['/detail']);
    }
  }

  irReporte(): void {
    this.router.navigate(['/report']);
  }
  irUsuarios(): void {
    this.router.navigate(['/users']);
  }
}
