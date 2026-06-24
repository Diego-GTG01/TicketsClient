import { Component, OnInit } from '@angular/core';
import { UserService } from '../../Services/user-service';
import { Usuario } from '../../Interfaces/usuario';
import { CommonModule } from '@angular/common'; 
import Swal from 'sweetalert2';
import { UserBadgeComponent } from '../user-badge-component/user-badge-component';
import { Router } from '@angular/router';
import { AuthService } from '../../Services/auth-service';

@Component({
  selector: 'app-vista-usuarios',
  standalone: true,
  imports: [CommonModule, UserBadgeComponent],
  templateUrl: './vista-usuarios.html',
  styleUrl: './vista-usuarios.css',
})
export class VistaUsuarios implements OnInit {
  usuarios: Usuario[] = [];

  miRol: string | null = null;
  token: string | null = null;
  username: string | null = null;
  idUsuario: number | null = null;
  usuarioSesion: any;

  constructor(
    private usuarioService: UserService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.miRol = this.authService.getUserRol();
    this.token = this.authService.getToken();
    this.username = this.authService.getUsername();
    this.idUsuario = Number(this.authService.getIdUsuario());
    this.usuarioSesion = { nombre: this.username, rol: this.miRol };
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.usuarioService.getAllUsers().subscribe({
      next: (result) => {
        if (result.correct) {
          this.usuarios = result.objects;

          Swal.fire('¡Éxito!', 'Se han obtenido todos los usuarios correctamente.', 'success');
        } else {
          Swal.fire('Error', 'Algo salió mal, no se pudo traer a los usuarios.', 'error');
        }
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        Swal.fire('Error', 'Error de conexión con el servidor.', 'error');
      },
    });
  }
}
