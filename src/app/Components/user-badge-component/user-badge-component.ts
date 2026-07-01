import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../Services/auth-service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-badge-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-badge-component.html',
  styleUrl: './user-badge-component.css',
})
export class UserBadgeComponent {
  @Input() usuario: any = null;
  @Output() onLogout = new EventEmitter<void>();

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  confirmarLogout(): void {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro de que deseas salir de tu cuenta actual?',
      icon: 'question', 
      showCancelButton: true,
      confirmButtonColor: '#dc3545', 
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar',
      reverseButtons: true, 
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Sesión cerrada',
          text: '¡Hasta luego!',
          icon: 'success',
          timer: 900, 
          showConfirmButton: false,
        }).then(() => {
          this.onLogout.emit();
          this.authService.logout();
          this.router.navigate(['']);
        });
      }
    });
  }
}