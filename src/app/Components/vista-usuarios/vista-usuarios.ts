import { Component, OnInit } from '@angular/core';
import { UserService } from '../../Services/user-service';
import { Usuario } from '../../Interfaces/usuario';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { UserBadgeComponent } from '../user-badge-component/user-badge-component';
import { Router } from '@angular/router';
import { AuthService } from '../../Services/auth-service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RolService } from '../../Services/rol-service';
import { Rol } from '../../Interfaces/rol';
import { errorContext } from 'rxjs/internal/util/errorContext';

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

  usuarioForm: FormGroup;
  roles: Rol[] = [];

  constructor(
    private usuarioService: UserService,
    private rolService: RolService,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
  ) {
    this.usuarioForm = this.fb.group({
      nombre: ['', Validators.required],
      apellidoPaterno: ['', Validators.required],
      apellidoMaterno: [''],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: [''],
      celular: [''],
      rol: [null, Validators.required],
      activo: [1],
    });
  }

  ngOnInit(): void {
    this.miRol = this.authService.getUserRol();
    this.token = this.authService.getToken();
    this.username = this.authService.getUsername();
    this.idUsuario = Number(this.authService.getIdUsuario());
    this.usuarioSesion = { nombre: this.username, rol: this.miRol };
    this.cargarUsuarios();
    this.cargarRoles();
  }

  cargarRoles(): void {
    this.rolService.getAll().subscribe({
      next: (result) => {
        if (result.correct) {
          this.roles = result.objects;
        } else {
          console.warn(result.message);
        }
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  cargarUsuarios(): void {
    this.usuarioService.getAllUsers().subscribe({
      next: (result) => {
        if (result.correct) {
          this.usuarios = result.objects;
          console.log(this.usuarios);
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

  crearUsuario() {
    this.usuarioService.crearUsuario(true);
  }

  editarUsuario(isAdmin: boolean, user: any): void {
    this.cargarRoles();
    const idRolOriginal = user.rol?.idRol || 0;

    Swal.fire({
      title: 'Editar Usuario',
      width: '800px',
      html: `
      <div class="row g-2 text-start">
        <div class="col-md-6">
          <label class="fw-semibold">Nombre *</label>
          <input id="nombre" class="swal2-input" value="${user.nombre || ''}">
          <small id="errorNombre" class="text-danger d-block"></small>
        </div>

        <div class="col-md-6">
          <label class="fw-semibold">Apellido Paterno *</label>
          <input id="apellidoPaterno" class="swal2-input" value="${user.apellidoPaterno || ''}">
          <small id="errorApellidoPaterno" class="text-danger d-block"></small>
        </div>

        <div class="col-md-6">
          <label class="fw-semibold">Apellido Materno</label>
          <input id="apellidoMaterno" class="swal2-input" value="${user.apellidoMaterno || ''}">
        </div>

        <div class="col-md-6">
          <label class="fw-semibold">Usuario *</label>
          <input id="username" class="swal2-input" value="${user.username || ''}">
          <small id="errorUsername" class="text-danger d-block"></small>
        </div>

        <div class="col-md-6">
          <label class="fw-semibold">Email *</label>
          <input id="email" type="email" class="swal2-input" value="${user.email || ''}">
          <small id="errorEmail" class="text-danger d-block"></small>
        </div>

        <div class="col-md-6">
          <label class="fw-semibold">Teléfono *</label>
          <input id="telefono" class="swal2-input" value="${user.telefono || ''}">
          <small id="errorTelefono" class="text-danger d-block"></small>
        </div>

        <div class="col-md-6">
          <label class="fw-semibold">Celular *</label>
          <input id="celular" class="swal2-input" value="${user.celular || ''}">
          <small id="errorCelular" class="text-danger d-block"></small>
        </div>
        
        ${
          isAdmin
            ? `
          <div class="col-md-6">
            <label class="fw-semibold">Rol *</label>
            <select id="rol" class="swal2-select" style="display: flex;">
              <option value="">Seleccione...</option>
              ${this.roles
                .map(
                  (r) => `
                <option value="${r.idRol}" ${r.idRol === idRolOriginal ? 'selected' : ''}>
                  ${r.nombre}
                </option>
              `,
                )
                .join('')}
            </select>
            <small id="errorRol" class="text-danger d-block"></small>
          </div>
        `
            : ''
        }
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      cancelButtonText: 'Cancelar',

      preConfirm: () => {
        const limpiarError = (campo: string, error: string) => {
          const input = document.getElementById(campo);
          const mensaje = document.getElementById(error);
          input?.classList.remove('is-invalid');
          if (mensaje) mensaje.textContent = '';
        };

        const mostrarError = (campo: string, error: string, mensaje: string) => {
          const input = document.getElementById(campo);
          const errorElement = document.getElementById(error);
          input?.classList.add('is-invalid');
          if (errorElement) errorElement.textContent = mensaje;
        };

        limpiarError('nombre', 'errorNombre');
        limpiarError('apellidoPaterno', 'errorApellidoPaterno');
        limpiarError('username', 'errorUsername');
        limpiarError('email', 'errorEmail');
        limpiarError('telefono', 'errorTelefono');
        limpiarError('celular', 'errorCelular');
        if (isAdmin) limpiarError('rol', 'errorRol');

        const rolElement = document.getElementById('rol') as HTMLSelectElement;
        const rolValue = rolElement ? rolElement.value : '';

        const usuarioEditado = {
          idUsuario: user.idUsuario,
          nombre: (document.getElementById('nombre') as HTMLInputElement).value.trim(),
          apellidoPaterno: (
            document.getElementById('apellidoPaterno') as HTMLInputElement
          ).value.trim(),
          apellidoMaterno: (
            document.getElementById('apellidoMaterno') as HTMLInputElement
          ).value.trim(),
          username: (document.getElementById('username') as HTMLInputElement).value.trim(),
          email: (document.getElementById('email') as HTMLInputElement).value.trim(),
          telefono: (document.getElementById('telefono') as HTMLInputElement).value.trim(),
          celular: (document.getElementById('celular') as HTMLInputElement).value.trim(),
          rol: {
            idRol: isAdmin ? (rolValue ? Number(rolValue) : 0) : idRolOriginal,
          },
          activo: user.activo,
        };

        let valido = true;

        if (!usuarioEditado.nombre) {
          mostrarError('nombre', 'errorNombre', 'El nombre es obligatorio');
          valido = false;
        }

        if (!usuarioEditado.apellidoPaterno) {
          mostrarError(
            'apellidoPaterno',
            'errorApellidoPaterno',
            'El apellido paterno es obligatorio',
          );
          valido = false;
        }

        if (!usuarioEditado.username) {
          mostrarError('username', 'errorUsername', 'El usuario es obligatorio');
          valido = false;
        }

        if (!usuarioEditado.telefono) {
          mostrarError('telefono', 'errorTelefono', 'El teléfono es obligatorio');
          valido = false;
        }

        if (!usuarioEditado.celular) {
          mostrarError('celular', 'errorCelular', 'El celular es obligatorio');
          valido = false;
        }

        if (!usuarioEditado.email) {
          mostrarError('email', 'errorEmail', 'El correo es obligatorio');
          valido = false;
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(usuarioEditado.email)) {
            mostrarError('email', 'errorEmail', 'Ingrese un correo válido');
            valido = false;
          }
        }

        if (isAdmin && usuarioEditado.rol.idRol <= 0) {
          mostrarError('rol', 'errorRol', 'Debe seleccionar un rol');
          valido = false;
        }

        if (!valido) {
          return false;
        }

        return usuarioEditado;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        console.log('Datos enviados a actualizar:', result.value);

        this.usuarioService.updateUser(result.value).subscribe({
          next: (res) => {
            if (res.correct) {
              Swal.fire({
                icon: 'success',
                title: 'Usuario actualizado',
                text: 'Los cambios se guardaron correctamente',
              });
              this.cargarUsuarios();
            } else {
              Swal.fire('Error', 'No se pudieron guardar los cambios.', 'error');
            }
          },
          error: () => {
            Swal.fire('Error', 'Error interno del servidor.', 'error');
          },
        });
      }
    });
  }

  eliminarUsuario(usuario: Usuario) {
    if (usuario.idUsuario == this.idUsuario) {
      Swal.fire({
        title: 'No se puede borrar el usuario Actual',
        icon: 'warning',
      });
    } else {
      Swal.fire({
        title: '¿Estás seguro de eliminar este usuario?',
        text: 'Una vez eliminado, no se podran recuperar los datos.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: 'Cuidado!!',
            text: 'Esta seguro de querer eliminar este usuario? ',
            showCancelButton: true,
            confirmButtonText: 'Si, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            inputValidator: (value) => {
              if (!value || value.trim() === '') {
                return 'Debes agregar un comentario final de resolución para cerrar el caso.';
              }
              return null;
            },
          }).then((comentarioResult) => {
            if (comentarioResult.isConfirmed) {
              this.usuarioService.deleteUser(usuario.idUsuario).subscribe({
                next: (res) => {
                  if (res.correct) {
                    Swal.fire({
                      icon: 'success',
                      title: 'Usuario Eliminado',
                      text: 'El usuario Ha sido eliminado correctamente',
                    });
                    this.cargarUsuarios();
                  } else {
                    Swal.fire('Error', 'No se pudieron guardar los cambios.', 'error');
                  }
                },
                error: () => {
                  Swal.fire('Error', 'Error interno del servidor.', 'error');
                },
              });
            }
          });
        }
      });
    }
  }
}
