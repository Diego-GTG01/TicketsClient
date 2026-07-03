import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { firstValueFrom, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-vista-usuarios',
  standalone: true,
  imports: [CommonModule, UserBadgeComponent],
  templateUrl: './vista-usuarios.html',
  styleUrl: './vista-usuarios.css',
})
export class VistaUsuarios implements OnInit, OnDestroy {
  usuarios: Usuario[] = [];

  miRol: string | null = null;
  token: string | null = null;
  username: string | null = null;
  idUsuario: number | null = null;
  usuarioSesion: any;

  usuarioForm: FormGroup;
  roles: Rol[] = [];

  private destroy$ = new Subject<void>();

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

  async ngOnInit(): Promise<void> {
    if (!this.authService.isAuthenticated()) {
      this.authService.logout();
      return;
    }
    this.miRol = this.authService.getUserRol();
    this.token = this.authService.getToken();
    this.username = this.authService.getUsername();
    this.idUsuario = Number(this.authService.getIdUsuario());
    this.usuarioSesion = { nombre: this.username, rol: this.miRol };
    await this.cargarRoles();
    this.cargarUsuarios();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async cargarRoles(): Promise<void> {
    try {
      const result = await firstValueFrom(this.rolService.getAll());

      if (result.correct) {
        this.roles = result.objects;
        console.log(this.roles);
      } else {
        console.warn(result.message);
      }
    } catch (err) {
      console.error(err);
    }
  }

  cargarUsuarios(): void {
    this.usuarioService
      .getAllUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (result.correct) {
            this.usuarios = result.objects;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error de carga',
              text: 'No se pudo obtener la lista de usuarios.',
              confirmButtonColor: '#3085d6',
            });
          }
        },
        error: (err) => {
          if (err.status === 403) {
            Swal.fire({
              icon: 'error',
              title: 'Sesión expirada',
              text: 'Su sesión ha expirado. Por favor, inicie sesión nuevamente.',
              confirmButtonColor: '#3085d6',
            }).then(() => {
              this.authService.logout();
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error de conexión',
              text: 'No se pudo conectar con el servidor.',
              confirmButtonColor: '#3085d6',
            });
          }
          console.error('Error al cargar usuarios:', err);
        },
      });
  }

  crearUsuario() {
    this.usuarioService.crearUsuario(true);
  }

  async editarUsuario(isAdmin: boolean, user: any): Promise<void> {
    if (user.idUsuario === this.idUsuario) {
      isAdmin = false;
    }
    const idRolOriginal = user.rol?.idRol || 0;

    await this.cargarRoles();

    Swal.fire({
      title: 'Editar Usuario',
      customClass: {
        popup: 'shadow-lg rounded-4 p-4',
        title: 'fw-bold text-secondary fs-4 border-bottom pb-2 text-start w-100',
        actions: 'w-100 justify-content-end gap-2 border-top pt-3 mt-4',
        confirmButton: 'btn btn-primary fw-semibold px-4 py-2 order-2',
        cancelButton: 'btn btn-outline-secondary fw-semibold px-4 py-2 order-1',
      },
      buttonsStyling: false,
      width: 'auto',

      html: `
      <div class="row g-3 text-start px-1" style="max-width: 720px;">
        
        <div class="col-sm-6">
          <label class="form-label fw-semibold small text-muted mb-1">Nombre *</label>
          <input id="nombre" class="form-control shadow-sm" value="${user.nombre || ''}">
          <div id="errorNombre" class="invalid-feedback d-block mt-1 small"></div>
        </div>

        <div class="col-sm-6">
          <label class="form-label fw-semibold small text-muted mb-1">Apellido Paterno *</label>
          <input id="apellidoPaterno" class="form-control shadow-sm" value="${user.apellidoPaterno || ''}">
          <div id="errorApellidoPaterno" class="invalid-feedback d-block mt-1 small"></div>
        </div>

        <div class="col-sm-6">
          <label class="form-label fw-semibold small text-muted mb-1">Apellido Materno</label>
          <input id="apellidoMaterno" class="form-control shadow-sm" value="${user.apellidoMaterno || ''}">
        </div>

       
        
        <div class="col-sm-6">
          <label class="form-label fw-semibold small text-muted mb-1">Teléfono *</label>
          <input id="telefono" class="form-control shadow-sm" value="${user.telefono || ''}">
          <div id="errorTelefono" class="invalid-feedback d-block mt-1 small"></div>
        </div>

        <div class="col-sm-6">
          <label class="form-label fw-semibold small text-muted mb-1">Celular *</label>
          <input id="celular" class="form-control shadow-sm" value="${user.celular || ''}">
          <div id="errorCelular" class="invalid-feedback d-block mt-1 small"></div>
        </div>
        
        ${
          isAdmin
            ? `
          <div class="col-sm-6">
            <label class="form-label fw-semibold small text-muted mb-1">Rol *</label>
            <select id="rol" class="form-select shadow-sm">
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
            <div id="errorRol" class="invalid-feedback d-block mt-1 small"></div>
          </div>
        `
            : ''
        }
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#0d6efd',
      cancelButtonColor: '#6c757d',
      reverseButtons: true,

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
          username: (user.username || '').trim(),
          email: (user.email || '').trim(),
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

        return valido ? usuarioEditado : false;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Guardando cambios',
          text: 'Por favor, espere...',
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => Swal.showLoading(),
        });

        this.usuarioService
          .updateUser(result.value)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (res) => {
              if (res.correct) {
                Swal.fire({
                  icon: 'success',
                  title: '¡Actualizado!',
                  text: 'Los cambios se guardaron correctamente.',
                  showConfirmButton: false,
                  timer: 1500,
                }).then(() => this.cargarUsuarios());
              } else {
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: 'No se pudieron guardar los cambios.',
                  confirmButtonColor: '#d33',
                });
              }
            },
            error: (err) => {
              if (err.status === 400) {
                Swal.fire({
                  icon: 'error',
                  title: 'Username Invalido',
                  text: 'El username ya está en uso.',
                  confirmButtonColor: '#d33',
                });
              } else {
                Swal.fire({
                  icon: 'error',
                  title: 'Error de servidor',
                  text: 'Ocurrió un problema interno en el sistema.',
                  confirmButtonColor: '#d33',
                });
              }
            },
          });
      }
    });
  }

  eliminarUsuario(usuario: Usuario) {
    if (usuario.idUsuario === this.idUsuario) {
      Swal.fire({
        icon: 'warning',
        title: 'Acción inválida',
        text: 'No puedes eliminar al usuario con el que tienes la sesión iniciada.',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    Swal.fire({
      title: '¿Estás seguro?',
      text: `Vas a eliminar permanentemente al usuario ${usuario.username}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Confirmación final',
          text: '¿Reconfirmas la eliminación definitiva?',
          icon: 'error',
          showCancelButton: true,
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar',
          confirmButtonColor: '#dc3545',
          cancelButtonColor: '#6c757d',
          reverseButtons: true,
        }).then((comentarioResult) => {
          if (comentarioResult.isConfirmed) {
            Swal.fire({
              title: 'Eliminando usuario',
              text: 'Por favor, espere...',
              allowOutsideClick: false,
              allowEscapeKey: false,
              didOpen: () => Swal.showLoading(),
            });

            this.usuarioService
              .deleteUser(usuario.idUsuario)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: (res) => {
                  if (res.correct) {
                    Swal.fire({
                      icon: 'success',
                      title: '¡Eliminado!',
                      text: 'El usuario ha sido eliminado correctamente.',
                      showConfirmButton: false,
                      timer: 1500,
                    }).then(() => this.cargarUsuarios());
                  } else {
                    Swal.fire({
                      icon: 'error',
                      title: 'Error',
                      text: 'No se pudo eliminar al usuario.',
                      confirmButtonColor: '#d33',
                    });
                  }
                },
                error: () => {
                  Swal.fire({
                    icon: 'error',
                    title: 'Error de servidor',
                    text: 'Ocurrió un problema de red.',
                    confirmButtonColor: '#d33',
                  });
                },
              });
          }
        });
      }
    });
  }

  volver() {
    this.router.navigate(['/tickets']);
  }
}
