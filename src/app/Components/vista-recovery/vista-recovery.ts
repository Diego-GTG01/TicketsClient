import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; // Importamos Router
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TokenService } from '../../Services/token-service';
import Swal from 'sweetalert2'; // Importamos SweetAlert2

@Component({
  selector: 'app-vista-recovery',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vista-recovery.html',
  styleUrl: './vista-recovery.css',
})
export class VistaRecovery implements OnInit {
  token: string = '';
  cargando = true;
  tokenValido = false;
  password = '';
  confirmPassword = '';
  mensaje = '';

  tokenEnviar: any = {
    idToken: 0,
    token: '',
    usuarioToken: {
      idUsuario: 0,
      username: '',
      password: '',
    },
    fechaExpiracion: undefined,
    tipo: 1,
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tokenService: TokenService,
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.token = params.get('token') ?? '';
      if (!this.token) {
        this.cargando = false;
        this.tokenValido = false;
        this.mensaje = 'No se encontró el token de recuperación.';
        Swal.fire({
          icon: 'error',
          title: 'Acceso denegado',
          text: 'No se proporcionó un token válido.',
          confirmButtonColor: '#3085d6'
        });
        return;
      }

      this.validarToken();
    });
  }

  validarToken() {
    this.tokenService.verifyToken(this.token).subscribe({
      next: (result) => {
        this.cargando = false;
        if (result.correct) {
          this.tokenValido = true;
          Swal.fire({
            icon: 'success',
            title: 'Token verificado',
            text: 'Por favor, ingresa tu nueva contraseña.',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
          });
        } else {
          this.tokenValido = false;
          this.mensaje = 'El enlace ha expirado o es inválido.';
          Swal.fire({
            icon: 'error',
            title: 'Enlace inválido',
            text: 'El token ha expirado o ya fue utilizado.',
            confirmButtonColor: '#d33'
          });
        }
      },
      error: (error) => {
        this.cargando = false;
        this.tokenValido = false;
        this.mensaje = 'Ocurrió un error al validar el token.';
        Swal.fire({
          icon: 'error',
          title: 'Error de servidor',
          text: 'No se pudo validar el estado del token. Intenta más tarde.',
        });
      },
    });
  }

  cambiarPassword() {
    if (!this.password || !this.confirmPassword) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor, llena ambos campos de contraseña.',
      });
      return;
    }

    if (this.password !== this.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Contraseñas no coinciden',
        text: 'Asegúrate de que ambas contraseñas sean idénticas.',
      });
      return;
    }

    Swal.fire({
      title: 'Actualizando contraseña...',
      text: 'Por favor espera un momento.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.tokenEnviar.token = this.token;
    this.tokenEnviar.usuarioToken.password = this.password;

    this.tokenService.verifyTokenRecovery(this.tokenEnviar).subscribe({
      next: (result) => {
        Swal.close(); 

        if (result.correct) {
          Swal.fire({
            icon: 'success',
            title: '¡Contraseña actualizada!',
            text: 'Tu contraseña se ha cambiado con éxito. Serás redirigido al inicio de sesión.',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Ir al Login',
            allowOutsideClick: false
          }).then((btnResult) => {
            if (btnResult.isConfirmed) {
              // Ajusta '/login' por la ruta real de tu login
              this.router.navigate(['/login']); 
            }
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: result.message || 'No se pudo actualizar la contraseña.',
          });
        }
      },
      error: (err) => {
        Swal.close();
        Swal.fire({
          icon: 'error',
          title: 'Error inesperado',
          text: 'Ocurrió un fallo en el servidor al intentar cambiar la contraseña.',
        });
      }
    });
  }
}