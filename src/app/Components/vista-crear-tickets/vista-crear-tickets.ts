import { Component, OnInit, inject } from '@angular/core'; // 1. Importamos inject
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
    status: 1
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
    this.miRol = this.authService.getUserRol();
    this.token = this.authService.getToken();
    this.username = this.authService.getUsername();
    this.idUsuario = Number(this.authService.getIdUsuario());
    this.usuario.idUsuario = this.idUsuario;
    this.usuarioSesion = { nombre: this.username, rol: this.miRol };
    console.log('El rol del usuario es:', this.miRol);
    console.log('El token: ', this.token);

    this.prioridadService.getAll().subscribe({
      next: (result) => {
        if (result.correct) {
          this.prioridades = result.objects;
          console.log('prioridades obtenidas');
        } else {
          console.warn('Algo salió mal');
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
        title: 'Formulario incompleto',
        text: 'Por favor completa todos los campos requeridos.',
      });

      return;
    }

    this.ticket.titulo = this.ticketForm.value.titulo;
    this.ticket.descripcion = this.ticketForm.value.descripcion;
    this.ticket.prioridad = this.ticketForm.value.prioridad;
    this.ticket.usuarioSolicitante = this.usuario;

    console.log(this.ticket)

    this.ticketService.addTicket(this.ticket).subscribe({
      next: (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Ticket creado',
          text: 'El ticket se registró correctamente.',
          confirmButtonText: 'Aceptar',
        });

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
          status: 1
        };
        this.router.navigate(['/tickets']);
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No fue posible crear el ticket.',
        });

        console.error(err);
      },
    });
  }
}
