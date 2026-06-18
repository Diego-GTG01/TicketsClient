import { Component, OnInit } from '@angular/core';
import { TicketService } from '../../Services/ticket-service';
import { Ticket } from '../../Interfaces/ticket';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../Services/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-vista-tickets',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vista-tickets.html',
  styleUrl: './vista-tickets.css',
})
export class VistaTickets implements OnInit {
  tickets: Ticket[] = [];
  miRol: string | null = null;
  token: string | null = null;

  constructor(
    private ticketService: TicketService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.miRol = this.authService.getUserRol();
    this.token = this.authService.getToken();
    console.log('El rol del usuario es:', this.miRol);
    console.log('El token: ', this.token);
    this.ticketService.getAllTickets().subscribe({
      next: (result) => {
        this.tickets = result.objects;
        console.log(this.tickets);
      },
      error: (err) => {
        console.warn(err);
      },
    });
  }

  verDetalle(ticket: Ticket): void {
    localStorage.setItem('ticket', JSON.stringify(ticket));
    this.router.navigate(['/detail']);
  }

  irReporte(): void {
  this.router.navigate(['/report']); 
}
}
