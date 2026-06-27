import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UsuarioLogin } from '../../Interfaces/usuario-login';
import { LoginResponse } from '../../Interfaces/loginResponse';
import { AuthService } from '../../Services/auth-service';

import Swal from 'sweetalert2';
import { RolService } from '../../Services/rol-service';
import { UserService } from '../../Services/user-service';
import { Rol } from '../../Interfaces/rol';

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
    Swal.fire({
      title: 'Iniciando sesión',
      text: 'Por favor, espere...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this.authService.login(this.usuario).subscribe({
      next: (result) => {
        Swal.close();

        if (result.correct) {
          Swal.fire({
            icon: 'success',
            title: result.message || '¡Bienvenido!',
            showConfirmButton: false,
            timer: 1500,
          }).then(() => {
            this.router.navigate(['/tickets']);
          });
        } else {
          this.error = result.message || 'Error en las credenciales.';
          Swal.fire({
            icon: 'warning',
            title: 'Atención',
            text: this.error,
            confirmButtonColor: '#3085d6',
          });
        }
      },
      error: (err) => {
        Swal.close();
        console.error('Error completo del login:', err);

        this.error = err.error?.message || err.message || 'No se pudo conectar con el servidor.';

        Swal.fire({
          icon: 'error',
          title: 'Error de Autenticación',
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
