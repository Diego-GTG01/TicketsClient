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
import { AgentService } from '../../Services/agent-service';

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
    Fecha: new Date(),
  };

  agentesDisponibles: any[] = [
  ];

  estadosDisponibles: EstadoTicket[] = [];
  estadosDisponiblesParaCambio: EstadoTicket[] = [];

  miRol: string | null = null;
  token: string | null = null;
  username: string | null = null;
  idUsuario: number | null = null;

  constructor(
    private ticketService: TicketService,
    private comentarioService: ComentarioService,
    private historialService: HistorialService,
    private authService: AuthService,
    private estadoService: EstadoService,
    private agentService: AgentService,
  ) {}

  ngOnInit(): void {
    const ticketLocal = localStorage.getItem('ticket');
    this.miRol = this.authService.getUserRol();
    this.token = this.authService.getToken();
    this.username = this.authService.getUsername();
    this.idUsuario = Number(this.authService.getIdUsuario());
    this.usuarioSesion = { nombre: this.username, rol: this.miRol };

    console.log('El username es:', this.username);
    console.log('El rol del usuario es:', this.miRol);
    console.log('El token: ', this.token);
    console.log('El idUsuario: ', this.idUsuario);
    if (ticketLocal) {
      this.ticket = JSON.parse(ticketLocal);
    }

    if (this.ticket.idTicket > 0) {
      this.cargarDatosTicket();
      this.cargarEstados();
      this.cargarAgentes();
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
    this.agentService.getAllUsers("Agente").subscribe({
     
      next: (result) => {
         console.log(result)
         this.agentesDisponibles= result.objects
      },
      error: (error) => {
        console.error(error)
      },
    });
  }

  cargarEstados(): void {
    this.estadoService.getAllEstados().subscribe({
      next: (result) => {
        if (result.correct) {
          console.log(result);
          this.estadosDisponibles = result.objects.flat();
          this.estadosDisponiblesParaCambio = this.estadosDisponibles.filter(
            (item) => item.nombre !== 'Cerrado',
          );
        } else {
          console.log(result);
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
          const fechaA = new Date(a.Fecha).getTime();
          const fechaB = new Date(b.Fecha).getTime();
          return fechaA - fechaB; // Ascendente (viejo a nuevo)
        });
      },
      error: (err) => console.error('Error al cargar comentarios:', err),
    });
  }

  cargarHistorial(): void {
    this.historialService.getHistorialById(this.ticket.idTicket).subscribe({
      next: (result) => {
        console.log(result);
        // Ordenar el historial de más viejo a más nuevo
        this.historial = result.objects.sort((a, b) => {
          const fechaA = new Date(a.fechaActualizaciion).getTime();
          const fechaB = new Date(b.fechaActualizaciion).getTime();
          return fechaA - fechaB; // Ascendente (viejo a nuevo)
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
      inputValidator: (value) => {
        if (!value) return 'Debes seleccionar un agente técnico';
        return null;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.ejecutarAsignacionBackend(Number(result.value));
      }
    });
  }

  private ejecutarAsignacionBackend(idAgente: number): void {
    const ticketActualizado = { ...this.ticket };
    ticketActualizado.agenteAsignado = { idUsuario: idAgente } as any;

    // this.ticketService.update(ticketActualizado).subscribe({
    //   next: () => {
    //     Swal.fire('¡Asignado!', 'El agente ha sido asignado con éxito.', 'success');
    //     this.cargarDatosTicket();
    //   },
    //   error: (err) => {
    //     console.error(err);
    //     Swal.fire('Error', 'No se pudo asignar el agente.', 'error');
    //   }
    // });
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
      confirmButtonColor: '#ffc107',
      cancelButtonColor: '#6c757d',
      inputValidator: (value) => {
        if (!value) return 'Debes elegir un estado';
        return null;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.ejecutarCambioEstadoBackend(Number(result.value));
      }
    });
  }

  private ejecutarCambioEstadoBackend(result: number): void {
    console.log(result);
    const estadoActual = this.estadosDisponibles.find((t) => t.idEstado === result);
    if (!estadoActual) {
      console.error('Estado no encontrado', result);
      Swal.fire('Error', 'No se encontró el estado seleccionado.', 'error');
      return;
    }

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
    console.log(this.historialNuevo);

    this.historialService.updateEstado(this.historialNuevo).subscribe({
      next: () => {
        Swal.fire('¡Actualizado!', 'El estado del ticket ha cambiado.', 'success');
        this.cargarDatosTicket();
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'No se pudo actualizar el estado.', 'error');
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
          inputValidator: (value) => {
            if (!value || value.trim() === '') {
              return 'Debes agregar un comentario final de resolución para cerrar el caso.';
            }
            return null;
          },
        }).then((comentarioResult) => {
          if (comentarioResult.isConfirmed) {
            this.ejecutarCierreConComentario(comentarioResult.value);
          }
        });
      }
    });
  }

  private ejecutarCierreConComentario(comentarioFinal: string): void {
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

    console.log('Historial de cierre:', historialCierre);

    this.historialService.updateEstado(historialCierre).subscribe({
      next: (result) => {
        console.log('Resultado del cierre:', result);

        this.nuevoComentario = {
          idComentario: 0,
          ticket: this.ticket,
          usuario: {
            idUsuario: Number(this.idUsuario),
          },
          mensaje: comentarioFinal,
          Fecha: new Date(),
        };

        this.comentarioService.addComentario(this.nuevoComentario).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: '¡Ticket Cerrado!',
              text: 'El caso ha sido solucionado y archivado correctamente.',
              confirmButtonColor: '#28a745',
            });
            this.cargarDatosTicket();
          },
          error: (err) => {
            console.error('Error al guardar comentario final:', err);
            Swal.fire(
              'Advertencia',
              'El ticket se cerró pero no se pudo guardar el comentario final.',
              'warning',
            );
            this.cargarDatosTicket();
          },
        });
      },
      error: (err) => {
        console.error('Error al cerrar ticket:', err);
        Swal.fire(
          'Error',
          'Ocurrió un error al intentar cerrar el ticket. Verifica que tengas permisos.',
          'error',
        );
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
    this.nuevoComentario = {
      idComentario: 0,
      ticket: this.ticket,
      usuario: {
        idUsuario: Number(this.idUsuario),
      },
      mensaje: mensaje,
      Fecha: new Date(),
    };
    console.log(this.nuevoComentario);

    this.comentarioService.addComentario(this.nuevoComentario).subscribe({
      next: () => {
        Swal.fire('¡Actualizado!', 'El estado del ticket ha cambiado.', 'success');
        this.cargarComentarios();
      },
      error: () => {
        Swal.fire('Error', 'No se pudo guardar el comentario en el historial.', 'error');
      },
    });
  }
}
