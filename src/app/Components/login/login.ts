import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UsuarioLogin } from '../../Interfaces/usuario-login';
import { AuthService } from '../../Services/auth-service';
import { RolService } from '../../Services/rol-service';
import { UserService } from '../../Services/user-service';
import { Rol } from '../../Interfaces/rol';
import { TokenService } from '../../Services/token-service';

import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';

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
  token: any = {
    idToken: 0,
    token: '',
    usuarioToken: {
      idUsuario: 0,
      username: '',
    },
    fechaExpiracion: undefined,
    tipo: 1,
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private usuarioService: UserService,
    private rolService: RolService,
    private tokenService: TokenService,
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

        if (err.status === 403) {
          Swal.fire({
            icon: 'error',
            title: 'Usuario no habilitado',
            text: `${this.error}\nRevise su correo registrado en el sistema.`,
            confirmButtonColor: '#d33',
          });
        } else if (err.status === 400) {
          Swal.fire({
            icon: 'error',
            title: 'Datos incorrectos',
            text: `${this.error}\nPor favor, verifica los datos ingresados.`,
            confirmButtonColor: '#d33',
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Algo salió mal',
            text: `${this.error}\nPor favor intente nuevamente.`,
            confirmButtonColor: '#d33',
          });
        }
      },
    });
  }

  recuperarContrasena(): void {
    Swal.fire({
      title: 'Recuperar contraseña',
      text: 'Ingresa tu nombre de usuario para solicitar el restablecimiento:',
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off',
        placeholder: 'Tu nombre de usuario',
      },
      showCancelButton: true,
      confirmButtonText: 'Enviar solicitud',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      showLoaderOnConfirm: true,
      preConfirm: async (username) => {
        if (!username || username.trim() === '') {
          Swal.showValidationMessage('El nombre de usuario es obligatorio');
          return false;
        }

        this.token.usuarioToken.username = username.trim();
        this.token.tipo = 1;

        try {
          const result = await firstValueFrom(this.tokenService.addToken(this.token));
          
          if (!result.correct) {
            Swal.showValidationMessage(`Error: ${result.message || 'No se pudo procesar'}`);
            return false;
          }
          return username.trim(); 
        } catch (err: any) {
          Swal.showValidationMessage(`Error de red: ${err.message || 'Intente más tarde'}`);
          return false;
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        Swal.fire({
          icon: 'success',
          title: 'Correo de Recuperación Enviado',
          text: `Se ha enviado un correo para restablecer la cuenta de: ${result.value}.`,
          confirmButtonColor: '#3085d6',
        });
      } 
    });
  }

  crearUsuario() {
    this.usuarioService.crearUsuario(false);
  }
}