import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketService } from '../../Services/ticket-service';
import { Ticket } from '../../Interfaces/ticket';
import { ComentarioService } from '../../Services/comentario-service';
import { Comentario } from '../../Interfaces/comentario';
import { DatePipe } from '@angular/common';
import { Historial } from '../../Interfaces/historial';
import { HistorialService } from '../../Services/historial-service';
import { Usuario } from '../../Interfaces/usuario';
import Swal from 'sweetalert2';
import { AuthService } from '../../Services/auth-service';
import { EstadoTicket } from '../../Interfaces/estado-ticket';
import { EstadoService } from '../../Services/estado-service';
import { UserBadgeComponent } from '../user-badge-component/user-badge-component';
import { UserService } from '../../Services/user-service';
import { PrioridadService } from '../../Services/prioridad-service';
import { Prioridad } from '../../Interfaces/prioridad';
import { Router } from '@angular/router';

@Component({
  selector: 'app-vista-detalle-ticket',
  standalone: true,
  imports: [DatePipe, CommonModule, UserBadgeComponent],
  templateUrl: './vista-detalle-ticket.html',
  styleUrl: './vista-detalle-ticket.css',
})
export class VistaDetalleTicket implements OnInit {
  usuarioSesion: any;

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
      rol: { idRol: 0, nombre: '', descripcion: '' },
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
      rol: { idRol: 0, nombre: '', descripcion: '' },
    },
    prioridad: { idPrioridad: 0, nombre: '' },
    estado: { idEstado: 0, nombre: '' },
    status: 0,
  };

  comentarios: Comentario[] = [];
  historial: Historial[] = [];

  historialNuevo: Historial = {
    idHistorial: 0,
    ticket: this.ticket,
    estadoAnterior: this.ticket.estado!,
    estadoActual: this.ticket.estado!,
    usuario: {
      idUsuario: 0,
    },
    fechaActualizaciion: new Date(),
    descripcionCambio: '',
  };
  nuevoComentario: Comentario = {
    idComentario: 0,
    ticket: this.ticket,
    usuario: {
      idUsuario: 0,
    },
    mensaje: '',
    fecha: new Date(),
  };

  agentesDisponibles: any[] = [];

  estadosDisponibles: EstadoTicket[] = [];
  estadosDisponiblesParaCambio: EstadoTicket[] = [];

  miRol: string | null = null;
  token: string | null = null;
  username: string | null = null;
  idUsuario: number | null = null;

  public prioridades: Prioridad[] = [];

  constructor(
    private ticketService: TicketService,
    private comentarioService: ComentarioService,
    private historialService: HistorialService,
    private authService: AuthService,
    private estadoService: EstadoService,
    private agentService: UserService,
    private prioridadService: PrioridadService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const ticketLocal = localStorage.getItem('ticket');
    if (!this.authService.isAuthenticated()) {
      this.authService.logout();
    }
    this.miRol = this.authService.getUserRol();
    this.token = this.authService.getToken();
    this.username = this.authService.getUsername();
    this.idUsuario = Number(this.authService.getIdUsuario());
    this.usuarioSesion = { nombre: this.username, rol: this.miRol };

    if (ticketLocal) {
      this.ticket = JSON.parse(ticketLocal);
    }

    if (this.ticket.idTicket > 0) {
      this.cargarDatosTicket();
      this.cargarEstados();
      this.cargarAgentes();
      this.cargarPrioridades();
    }
  }

  cargarDatosTicket(): void {
    this.ticketService.getById(this.ticket.idTicket).subscribe({
      next: (result) => {
        this.ticket = result.object;
        this.cargarComentarios();
        this.cargarHistorial();
      },
      error: (err) => console.error('Error al cargar ticket:', err),
    });
  }

  cargarAgentes(): void {
    this.agentService.getAllUsersByRol('Agente').subscribe({
      next: (result) => {
        this.agentesDisponibles = result.objects;
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  cargarEstados(): void {
    this.estadoService.getAllEstados().subscribe({
      next: (result) => {
        if (result.correct) {
          this.estadosDisponibles = result.objects.flat();
          this.estadosDisponiblesParaCambio = this.estadosDisponibles.filter(
            (item) => item.nombre !== 'Cerrado',
          );
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  cargarPrioridades(): void {
    this.prioridadService.getAll().subscribe({
      next: (result) => {
        if (result.correct) {
          this.prioridades = result.objects.flat();
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  cargarComentarios(): void {
    this.comentarioService.getComentarioByIdTicket(this.ticket.idTicket).subscribe({
      next: (result) => {
        this.comentarios = result.objects.sort((a, b) => {
          const fechaA = new Date(a.fecha).getTime();
          const fechaB = new Date(b.fecha).getTime();
          return fechaA - fechaB;
        });
      },
      error: (err) => console.error('Error al cargar comentarios:', err),
    });
  }

  cargarHistorial(): void {
    this.historialService.getHistorialById(this.ticket.idTicket).subscribe({
      next: (result) => {
        this.historial = result.objects.sort((a, b) => {
          const fechaA = new Date(a.fechaActualizaciion).getTime();
          const fechaB = new Date(b.fechaActualizaciion).getTime();
          return fechaA - fechaB;
        });
      },
      error: (err) => console.error('Error al cargar historial:', err),
    });
  }

  abrirModalAsignar(): void {
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
      confirmButtonText: 'Asignar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#0d6efd',
      cancelButtonColor: '#6c757d',
      reverseButtons: true,
      inputValidator: (value) => {
        if (!value) return 'Debes seleccionar un agente técnico';
        return null;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.AsignacionBackend(Number(result.value));
      }
    });
  }

  private AsignacionBackend(idAgente: number): void {
    Swal.fire({
      title: 'Asignando agente',
      text: 'Por favor, espere...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this.ticketService.updateAgente(this.ticket.idTicket, idAgente).subscribe({
      next: (result) => {
        if (result.correct) {
          Swal.fire({
            icon: 'success',
            title: '¡Asignado!',
            text: 'El agente ha sido asignado con éxito.',
            showConfirmButton: false,
            timer: 1500,
          }).then(() => {
            this.cargarDatosTicket();
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo asignar el agente.',
            confirmButtonColor: '#d33',
          });
        }
      },
      error: (err) => {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Error de servidor',
          text: 'No se pudo procesar la asignación.',
          confirmButtonColor: '#d33',
        });
      },
    });
  }

  abrirModalCambiarEstado(): void {
    const opcionesEstados: { [key: string]: string } = {};
    this.estadosDisponiblesParaCambio.forEach((e) => {
      opcionesEstados[e.idEstado] = e.nombre;
    });

    Swal.fire({
      title: 'Cambiar Estado del Ticket',
      input: 'select',
      inputOptions: opcionesEstados,
      inputPlaceholder: 'Seleccione el nuevo estado...',
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#0d6efd',
      cancelButtonColor: '#6c757d',
      reverseButtons: true,
      inputValidator: (value) => {
        if (!value) return 'Debes elegir un estado';
        return null;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.CambioEstadoBackend(Number(result.value));
      }
    });
  }

  private CambioEstadoBackend(result: number): void {
    const estadoActual = this.estadosDisponibles.find((t) => t.idEstado === result);
    if (!estadoActual) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se encontró el estado seleccionado.',
        confirmButtonColor: '#d33',
      });
      return;
    }

    Swal.fire({
      title: 'Actualizando estado',
      text: 'Por favor, espere...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this.historialNuevo = {
      idHistorial: 0,
      ticket: this.ticket,
      estadoAnterior: this.ticket.estado!,
      estadoActual,
      usuario: {
        idUsuario: Number(this.idUsuario),
      },
      fechaActualizaciion: new Date(),
      descripcionCambio: `Estado cambiado de "${this.ticket.estado?.nombre}" a "${estadoActual.nombre}"`,
    };

    this.historialService.updateEstado(this.historialNuevo).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: '¡Actualizado!',
          text: 'El estado del ticket ha cambiado.',
          showConfirmButton: false,
          timer: 1500,
        }).then(() => {
          this.cargarDatosTicket();
        });
      },
      error: (err) => {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo actualizar el estado.',
          confirmButtonColor: '#d33',
        });
      },
    });
  }

  abrirModalCerrarTicket(): void {
    Swal.fire({
      title: '¿Estás seguro de cerrar el ticket?',
      text: 'Una vez cerrado, el ticket pasará al archivo histórico y no podrá modificarse.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Resolución Final',
          text: 'Por favor, ingresa una descripción o motivo del cierre (Obligatorio)',
          input: 'textarea',
          inputPlaceholder: 'Detalla cómo se solucionó la incidencia...',
          showCancelButton: true,
          confirmButtonText: 'Cerrar Ticket Definitivamente',
          cancelButtonText: 'Cancelar',
          confirmButtonColor: '#dc3545',
          cancelButtonColor: '#6c757d',
          reverseButtons: true,
          inputValidator: (value) => {
            if (!value || value.trim() === '') {
              return 'Debes agregar un comentario final de resolución para cerrar el caso.';
            }
            return null;
          },
        }).then((comentarioResult) => {
          if (comentarioResult.isConfirmed) {
            this.CierreConComentario(comentarioResult.value);
          }
        });
      }
    });
  }

  private CierreConComentario(comentarioFinal: string): void {
    Swal.fire({
      title: 'Archivando caso',
      text: 'Por favor, espere...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const estadoCerrado = this.estadosDisponibles.find((e) => e.nombre === 'Cerrado') || {
      idEstado: 4,
      nombre: 'Cerrado',
    };

    const historialCierre: Historial = {
      idHistorial: 0,
      ticket: this.ticket,
      estadoAnterior: this.ticket.estado!,
      estadoActual: estadoCerrado,
      usuario: {
        idUsuario: Number(this.idUsuario),
      },
      fechaActualizaciion: new Date(),
      descripcionCambio: `🔒 Ticket cerrado: ${comentarioFinal}`,
    };

    this.historialService.updateEstado(historialCierre).subscribe({
      next: () => {
        this.nuevoComentario = {
          idComentario: 0,
          ticket: this.ticket,
          usuario: {
            idUsuario: Number(this.idUsuario),
          },
          mensaje: comentarioFinal,
          fecha: new Date(),
        };

        this.comentarioService.addComentario(this.nuevoComentario).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: '¡Ticket Cerrado!',
              text: 'El caso ha sido solucionado y archivado correctamente.',
              showConfirmButton: false,
              timer: 1500,
            }).then(() => {
              this.cargarDatosTicket();
            });
          },
          error: (err) => {
            console.error(err);
            Swal.fire({
              icon: 'warning',
              title: 'Cierre con advertencias',
              text: 'El ticket se cerró pero no se pudo guardar el comentario final.',
              confirmButtonColor: '#ffc107',
            }).then(() => {
              this.cargarDatosTicket();
            });
          },
        });
      },
      error: (err) => {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ocurrió un error al intentar cerrar el ticket.',
          confirmButtonColor: '#d33',
        });
      },
    });
  }

  abrirModalComentario(): void {
    Swal.fire({
      title: 'Agregar Comentario',
      input: 'textarea',
      inputLabel: 'Escribe una actualización o nota sobre el caso',
      inputPlaceholder: 'Escribe aquí tu comentario...',
      inputAttributes: { rows: '4' },
      showCancelButton: true,
      confirmButtonText: 'Guardar Comentario',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#0d6efd',
      cancelButtonColor: '#6c757d',
      reverseButtons: true,
      inputValidator: (value) => {
        if (!value || value.trim() === '') {
          return 'El mensaje no puede estar vacío';
        }
        return null;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.agregarComentario(result.value);
      }
    });
  }

  private agregarComentario(mensaje: string): void {
    Swal.fire({
      title: 'Publicando comentario',
      text: 'Por favor, espere...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this.nuevoComentario = {
      idComentario: 0,
      ticket: this.ticket,
      usuario: {
        idUsuario: Number(this.idUsuario),
      },
      mensaje: mensaje,
      fecha: new Date(),
    };

    this.comentarioService.addComentario(this.nuevoComentario).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: '¡Comentario añadido!',
          text: 'Tu nota ha sido agregada con éxito.',
          showConfirmButton: false,
          timer: 1500,
        }).then(() => {
          this.cargarComentarios();
        });
      },
      error: (err) => {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo guardar el comentario.',
          confirmButtonColor: '#d33',
        });
      },
    });
  }

  abrirModalCambiarPrioridad(): void {
    const opcionesPrioridades: { [key: string]: string } = {};
    this.prioridades.forEach((p) => {
      opcionesPrioridades[p.idPrioridad] = p.nombre;
    });

    Swal.fire({
      title: 'Cambiar Prioridad del Ticket',
      input: 'select',
      inputOptions: opcionesPrioridades,
      inputPlaceholder: 'Seleccione la nueva prioridad...',
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#0d6efd',
      cancelButtonColor: '#6c757d',
      reverseButtons: true,
      inputValidator: (value) => {
        if (!value) return 'Debes elegir una prioridad';
        return null;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.CambioPrioridadBackend(Number(result.value));
      }
    });
  }

  private CambioPrioridadBackend(idPrioridad: number): void {
    const prioridadSeleccionada = this.prioridades.find((p) => p.idPrioridad === idPrioridad);
    if (!prioridadSeleccionada) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se encontró la prioridad seleccionada.',
        confirmButtonColor: '#d33',
      });
      return;
    }

    Swal.fire({
      title: 'Cambiando prioridad',
      text: 'Por favor, espere...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this.ticketService.updatePrioridad(this.ticket.idTicket, idPrioridad).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: '¡Actualizado!',
          text: `La prioridad ha cambiado a "${prioridadSeleccionada.nombre}".`,
          showConfirmButton: false,
          timer: 1500,
        }).then(() => {
          this.cargarDatosTicket();
        });
      },
      error: (err) => {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo actualizar la prioridad.',
          confirmButtonColor: '#d33',
        });
      },
    });
  }

  volver() {
    this.router.navigate(['/tickets']);
  }
}