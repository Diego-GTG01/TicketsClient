import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Prioridad } from '../../Interfaces/prioridad';
import { PrioridadService } from '../../Services/prioridad-service';
import { TicketService } from '../../Services/ticket-service';
import { Ticket } from '../../Interfaces/ticket';
import { Usuario } from '../../Interfaces/usuario';

@Component({
  selector: 'app-vista-crear-tickets',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './vista-crear-tickets.html',
  styleUrl: './vista-crear-tickets.css',
})
export class VistaCrearTickets implements OnInit {
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
    this.ticket.titulo = this.ticketForm.value.titulo;
    this.ticket.descripcion = this.ticketForm.value.descripcion;
    this.ticket.titulo = this.ticketForm.value.titulo;
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
