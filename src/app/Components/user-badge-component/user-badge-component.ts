import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-badge-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-badge-component.html',
  styleUrl: './user-badge-component.css',
})
export class UserBadgeComponent {

constructor(private router: Router){

}

  @Input() usuario: any = null;
  @Output() onLogout = new EventEmitter<void>(); 

  confirmarLogout(): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Vas a cerrar tu sesión actual.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545', 
      cancelButtonColor: '#6c757d',  
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
       
        this.onLogout.emit();
        
       
        Swal.fire({
          title: 'Sesión cerrada',
          text: 'Hasta luego.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        this.router.navigate([''])
      }
    });
  }
}