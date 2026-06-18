import { Component, OnInit, inject } from '@angular/core'; // 1. Importamos inject
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Prioridad } from '../../Interfaces/prioridad';
import { PrioridadService } from '../../Services/prioridad-service';
import { TicketService } from '../../Services/ticket-service';
import { Ticket } from '../../Interfaces/ticket';
import { Usuario } from '../../Interfaces/usuario';
import { AuthService } from '../../Services/auth-service'; // 2. Importamos tu AuthService

@Component({
  selector: 'app-vista-crear-tickets',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
  };
  ticketForm: FormGroup;
  usuario: Usuario = {
    idUsuario: 5,
  };

  public miRol: string | null = null;
  public token: string | null = null;

  constructor(
    private fb: FormBuilder,
    private prioridadService: PrioridadService,
    private ticketService: TicketService,
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
    console.log('El rol del usuario es:', this.miRol);
    console.log('El token: ', this.token)


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
      return;
    }

    if (this.miRol === 'Administrador') {
      console.warn('Los usuarios con rol Invitado no pueden crear tickets.');
      return;
    }

    this.ticket.titulo = this.ticketForm.value.titulo;
    this.ticket.descripcion = this.ticketForm.value.descripcion;
    this.ticket.prioridad = this.ticketForm.value.prioridad;
    this.ticket.usuarioSolicitante = this.usuario;

    console.log(this.ticket);
    console.log(this.ticketForm.value);

    this.ticketService.addTicket(this.ticket).subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
}