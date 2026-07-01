import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UsuarioLogin } from '../../Interfaces/usuario-login';
import { AuthService } from '../../Services/auth-service';
import { RolService } from '../../Services/rol-service';
import { UserService } from '../../Services/user-service';
import { Rol } from '../../Interfaces/rol';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  usuario: UsuarioLogin = {
    username: '',
    password: '',
  };

  error = '';
  roles: Rol[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private usuarioService: UserService,
    private rolService: RolService,
  ) {}

  ngOnInit(): void {
    this.cargarRoles();
    this.authService.logout();
  }

  cargarRoles(): void {
    this.rolService.getAll().subscribe({
      next: (result) => {
        if (result.correct) {
          this.roles = result.objects;
        }
      },
    });
  }

  login(): void {
    if (!this.usuario.username.trim() || !this.usuario.password.trim()) {
      Swal.fire({
        icon: 'info',
        title: 'Campos vacíos',
        text: 'Por favor, introduce tu usuario y contraseña.',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    Swal.fire({
      title: 'Iniciando sesión',
      text: 'Por favor, espere un momento...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this.authService.login(this.usuario).subscribe({
      next: (result) => {
        if (result.correct) {
          Swal.fire({
            icon: 'success',
            title: '¡Ingreso exitoso!',
            text: result.message || 'Bienvenido al sistema.',
            showConfirmButton: false,
            timer: 1500,
          }).then(() => {
            this.router.navigate(['/tickets']);
          });
        } else {
          this.error = result.message || 'Credenciales incorrectas.';
          Swal.fire({
            icon: 'warning',
            title: 'No se pudo iniciar sesión',
            text: this.error,
            confirmButtonColor: '#3085d6',
          });
        }
      },
      error: (err) => {
        console.error('Error completo del login:', err);
        this.error = err.error?.message || err.message || 'No hay respuesta del servidor.';

        Swal.fire({
          icon: 'error',
          title: 'Error de conexión',
          text: this.error,
          confirmButtonColor: '#d33',
        });
      },
    });
  }

  crearUsuario() {
    this.usuarioService.crearUsuario(false);
  }
}