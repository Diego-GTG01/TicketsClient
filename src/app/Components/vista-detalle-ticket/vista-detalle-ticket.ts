import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketService } from '../../Services/ticket-service';
import { Ticket } from '../../Interfaces/ticket';
import { ComentarioService } from '../../Services/comentario-service';
import { Comentario } from '../../Interfaces/comentario';
import { DatePipe } from '@angular/common';
import { Historial } from '../../Interfaces/historial';
import { HistorialService } from '../../Services/historial-service';
import Swal from 'sweetalert2';
import { AuthService } from '../../Services/auth-service';
import { EstadoTicket } from '../../Interfaces/estado-ticket';
import { EstadoService } from '../../Services/estado-service';

@Component({
  selector: 'app-vista-detalle-ticket',
  standalone: true,
  imports: [DatePipe, CommonModule],
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

  agentesDisponibles: any[] = [
    { idUsuario: 1, username: 'soporte.tecnico' },
    { idUsuario: 2, username: 'diego.dev' },
    { idUsuario: 3, username: 'carlos.admin' },
  ];

  estadosDisponibles: EstadoTicket[] = [];

  miRol: string | null = null;
  token: string | null = null;
  username: string | null = null;

  constructor(
    private ticketService: TicketService,
    private comentarioService: ComentarioService,
    private historialService: HistorialService,
    private authService: AuthService,
    private estadoService: EstadoService,
  ) {}

  ngOnInit(): void {
    const ticketLocal = localStorage.getItem('ticket');
    this.miRol = this.authService.getUserRol();
    this.token = this.authService.getToken();
    this.username = this.authService.getUsername();

    console.log('El username es:', this.username);
    console.log('El rol del usuario es:', this.miRol);
    console.log('El token: ', this.token);
    if (ticketLocal) {
      this.ticket = JSON.parse(ticketLocal);
    }

    if (this.ticket.idTicket > 0) {
      this.cargarDatosTicket();
      this.cargarEstados();
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

  cargarEstados(): void {
    this.estadoService.getAllEstados().subscribe({
      next: (result) => {
        if (result.correct) {
          this.estadosDisponibles = result.objects.flat().filter((t) => {
            t.nombre.toLocaleLowerCase() !== '';
          });
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
      next: (result) => (this.comentarios = result.objects),
      error: (err) => console.error('Error al cargar comentarios:', err),
    });
  }

  cargarHistorial(): void {
    this.historialService.getHistorialById(this.ticket.idTicket).subscribe({
      next: (result) => (this.historial = result.objects),
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
    this.estadosDisponibles.forEach((e) => {
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

  private ejecutarCambioEstadoBackend(idEstado: number): void {
    const ticketActualizado = { ...this.ticket };
    ticketActualizado.estado = { idEstado: idEstado } as any;

    // this.ticketService.update(ticketActualizado).subscribe({
    //   next: () => {
    //     Swal.fire('¡Actualizado!', 'El estado del ticket ha cambiado.', 'success');
    //     this.cargarDatosTicket();
    //   },
    //   error: (err) => {
    //     console.error(err);
    //     Swal.fire('Error', 'No se pudo actualizar el estado.', 'error');
    //   }
    // });
  }

  abrirModalCerrarTicket(): void {
    // Paso 1: Confirmación
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
        // Paso 2: Obligar comentario final
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
    // 1. Modificar estado a Cerrado (Asumiendo ID 4 para 'Cerrado')
    const ticketCerrado = { ...this.ticket };
    ticketCerrado.estado = { idEstado: 4, nombre: 'Cerrado' } as any;

    // this.ticketService.update(ticketCerrado).subscribe({
    //   next: () => {
    //     // 2. Guardar el comentario final obligatorio
    //     this.enviarComentarioBackend(comentarioFinal);
    //     Swal.fire('¡Ticket Cerrado!', 'El caso ha sido solucionado y archivado.', 'success');
    //     this.cargarDatosTicket(); // Recargará la UI bloqueando los botones
    //   },
    //   error: (err) => {
    //     console.error(err);
    //     Swal.fire('Error', 'Ocurrió un error al intentar cerrar el ticket.', 'error');
    //   }
    // });
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
        this.enviarComentarioBackend(result.value);
      }
    });
  }

  private enviarComentarioBackend(mensaje: string): void {
    const nuevoComentario: any = {
      mensaje: mensaje,
      ticket: { idTicket: this.ticket.idTicket },
      usuario: { idUsuario: this.ticket.usuarioSolicitante?.idUsuario || 1 },
    };

    // this.comentarioService.save(nuevoComentario).subscribe({
    //   next: () => {
    //     this.cargarComentarios();
    //   },
    //   error: () => {
    //     Swal.fire('Error', 'No se pudo guardar el comentario en el historial.', 'error');
    //   }
    // });
  }
}
