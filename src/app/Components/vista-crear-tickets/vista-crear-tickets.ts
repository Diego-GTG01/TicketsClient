import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Prioridad } from '../../Interfaces/prioridad';
import { PrioridadService } from '../../Services/prioridad-service';
import { TicketService } from '../../Services/ticket-service';
import { Ticket } from '../../Interfaces/ticket';
import { Usuario } from '../../Interfaces/usuario';
import { AuthService } from '../../Services/auth-service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { UserBadgeComponent } from '../user-badge-component/user-badge-component';

@Component({
  selector: 'app-vista-crear-tickets',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UserBadgeComponent],
  templateUrl: './vista-crear-tickets.html',
  styleUrl: './vista-crear-tickets.css',
})
export class VistaCrearTickets implements OnInit {
  private authService = inject(AuthService);

  public prioridades: Prioridad[] = [];
  ticket: Ticket = {
    idTicket: 0,
    titulo: '',
    descripcion: '',
    agenteAsignado: undefined,
    prioridad: undefined,
    status: 1,
  };

  ticketForm: FormGroup;
  usuario: Usuario = {
    idUsuario: 0,
  };

  miRol: string | null = null;
  token: string | null = null;
  username: string | null = null;
  idUsuario: number | null = null;

  usuarioSesion: any;

  constructor(
    private fb: FormBuilder,
    private prioridadService: PrioridadService,
    private ticketService: TicketService,
    private router: Router,
  ) {
    this.ticketForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.maxLength(200)]],
      descripcion: ['', [Validators.required, Validators.maxLength(1000)]],
      prioridad: this.fb.group({
        idPrioridad: ['', [Validators.required]],
        nombre: [''],
      }),
    });
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.authService.logout();
    }
    this.miRol = this.authService.getUserRol();
    this.token = this.authService.getToken();
    this.username = this.authService.getUsername();
    this.idUsuario = Number(this.authService.getIdUsuario());
    this.usuario.idUsuario = this.idUsuario;
    this.usuarioSesion = { nombre: this.username, rol: this.miRol };

    this.prioridadService.getAll().subscribe({
      next: (result) => {
        if (result.correct) {
          this.prioridades = result.objects;
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error de carga',
            text: 'No se pudieron obtener las prioridades.',
            confirmButtonColor: '#3085d6',
          });
        }
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  crearTicket(): void {
    if (this.ticketForm.invalid) {
      this.ticketForm.markAllAsTouched();

      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Por favor complete todos los campos del formulario.',
        confirmButtonColor: '#3085d6',
      });

      return;
    }

    Swal.fire({
      title: 'Guardando ticket',
      text: 'Por favor, espere...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this.ticket.titulo = this.ticketForm.value.titulo;
    this.ticket.descripcion = this.ticketForm.value.descripcion;
    this.ticket.prioridad = this.ticketForm.value.prioridad;
    this.ticket.usuarioSolicitante = this.usuario;

    this.ticketService.addTicket(this.ticket).subscribe({
      next: (response) => {
        Swal.fire({
          icon: 'success',
          title: '¡Creado!',
          text: 'El ticket se registró correctamente.',
          showConfirmButton: false,
          timer: 1500,
        }).then(() => {
          this.ticketForm.reset();
          this.ticketForm.patchValue({
            prioridad: {
              idPrioridad: '',
              nombre: '',
            },
          });

          this.ticket = {
            idTicket: 0,
            titulo: '',
            descripcion: '',
            agenteAsignado: undefined,
            prioridad: undefined,
            status: 1,
          };
          this.router.navigate(['/tickets']);
        });
      },
      error: (err) => {
        console.error(err);

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
            title: 'Error al crear',
            text: err.error?.message || 'No fue posible guardar el ticket en este momento.',
            confirmButtonColor: '#d33',
          });
        }
      },
    });
  }

  volver() {
    this.router.navigate(['/tickets']);
  }
}
