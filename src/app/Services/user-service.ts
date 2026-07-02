import { HttpClient } from '@angular/common/http';
import { inject, Injectable, OnInit } from '@angular/core';

import { environment } from '../../environments/environment';
import { firstValueFrom, Observable } from 'rxjs';
import { Usuario } from '../Interfaces/usuario';
import { Result } from '../Interfaces/result';
import Swal from 'sweetalert2';
import { RolService } from './rol-service';
import { Rol } from '../Interfaces/rol';
@Injectable({
  providedIn: 'root',
})
export class UserService implements OnInit {
  apiUrl = environment.apiUrl + '/Usuario';

  roles: Rol[] = [];
  selectedRol: Rol = {
    idRol: 0,
    nombre: '',
    descripcion: '',
  };
  isAdmin: boolean = false;

  private http = inject(HttpClient);

  constructor(private rolService: RolService) {
    this.cargarRoles();
  }
  ngOnInit(): void {}

  getAllUsersByRol(agente: string): Observable<Result<Usuario>> {
    return this.http.get<Result<Usuario>>(this.apiUrl + '/byRol?nombre=' + agente);
  }

  getAllUsers(): Observable<Result<Usuario>> {
    return this.http.get<Result<Usuario>>(this.apiUrl);
  }

  addUser(user: Usuario): Observable<Result<Usuario>> {
    return this.http.post<Result<Usuario>>(this.apiUrl, user);
  }

  updateUser(user: Usuario): Observable<Result<Usuario>> {
    return this.http.put<Result<Usuario>>(this.apiUrl, user);
  }

  deleteUser(idUsuario: number): Observable<Result<Usuario>> {
    return this.http.delete<Result<Usuario>>(this.apiUrl + '?idUsuario=' + idUsuario);
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

  async crearUsuario(isAdmin: boolean): Promise<void> {
    await this.cargarRoles();

    this.isAdmin = isAdmin;

    Swal.fire({
      title: 'Crear Usuario',
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
          <input id="nombre" class="form-control shadow-sm">
          <div id="errorNombre" class="invalid-feedback d-block mt-1 small"></div>
        </div>

        <div class="col-sm-6">
          <label class="form-label fw-semibold small text-muted mb-1">Apellido Paterno *</label>
          <input id="apellidoPaterno" class="form-control shadow-sm">
          <div id="errorApellidoPaterno" class="invalid-feedback d-block mt-1 small"></div>
        </div>

        <div class="col-sm-6">
          <label class="form-label fw-semibold small text-muted mb-1">Apellido Materno</label>
          <input id="apellidoMaterno" class="form-control shadow-sm">
        </div>

        <div class="col-sm-6">
          <label class="form-label fw-semibold small text-muted mb-1">Usuario *</label>
          <input id="username" class="form-control shadow-sm">
          <div id="errorUsername" class="invalid-feedback d-block mt-1 small"></div>
        </div>

        <div class="col-sm-6">
          <label class="form-label fw-semibold small text-muted mb-1">Password *</label>
          <input id="password" type="password" class="form-control shadow-sm">
          <div id="errorPassword" class="invalid-feedback d-block mt-1 small"></div>
        </div>

        <div class="col-sm-6">
          <label class="form-label fw-semibold small text-muted mb-1">Confirmar Password *</label>
          <input id="passwordConfirmar" type="password" class="form-control shadow-sm">
          <div id="errorPasswordConfirmar" class="invalid-feedback d-block mt-1 small"></div>
        </div>

        <div class="col-sm-6">
          <label class="form-label fw-semibold small text-muted mb-1">Email *</label>
          <input id="email" type="email" class="form-control shadow-sm">
          <div id="errorEmail" class="invalid-feedback d-block mt-1 small"></div>
        </div>

        <div class="col-sm-6">
          <label class="form-label fw-semibold small text-muted mb-1">Teléfono *</label>
          <input id="telefono" class="form-control shadow-sm">
          <div id="errorTelefono" class="invalid-feedback d-block mt-1 small"></div>
        </div>

        <div class="col-sm-6">
          <label class="form-label fw-semibold small text-muted mb-1">Celular *</label>
          <input id="celular" class="form-control shadow-sm">
          <div id="errorCelular" class="invalid-feedback d-block mt-1 small"></div>
        </div>
        
        ${
          isAdmin
            ? `
          <div class="col-sm-6">
            <label class="form-label fw-semibold small text-muted mb-1">Rol *</label>
            <select id="rol" class="form-select shadow-sm">
              <option value="">Seleccione...</option>
              ${this.roles.map((r) => `<option value="${r.idRol}">${r.nombre}</option>`).join('')}
            </select>
            <div id="errorRol" class="invalid-feedback d-block mt-1 small"></div>
          </div>
        `
            : ''
        }

      </div>
    `,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,

      preConfirm: () => {
        const limpiarError = (campo: string, error: string) => {
          const input = document.getElementById(campo);
          const mensaje = document.getElementById(error);

          input?.classList.remove('is-invalid');

          if (mensaje) {
            mensaje.textContent = '';
          }
        };

        const mostrarError = (campo: string, error: string, mensaje: string) => {
          const input = document.getElementById(campo);
          const errorElement = document.getElementById(error);

          input?.classList.add('is-invalid');

          if (errorElement) {
            errorElement.textContent = mensaje;
          }
        };

        limpiarError('nombre', 'errorNombre');
        limpiarError('apellidoPaterno', 'errorApellidoPaterno');
        limpiarError('username', 'errorUsername');
        limpiarError('password', 'errorPassword');
        limpiarError('passwordConfirmar', 'errorPasswordConfirmar');
        limpiarError('email', 'errorEmail');
        limpiarError('telefono', 'errorTelefono');
        limpiarError('celular', 'errorCelular');
        limpiarError('rol', 'errorRol');

        if (isAdmin) {
          const rolElement = document.getElementById('rol') as HTMLSelectElement;
          const rolValue = rolElement ? rolElement.value : '';
          this.selectedRol = {
            idRol: rolValue ? Number(rolValue) : 0,
          };
        } else {
          this.selectedRol = {
            idRol: Number(this.roles?.find((r) => r.nombre === 'Usuario')?.idRol || 0),
          };
          console.log(this.selectedRol);
        }

        const usuario = {
          nombre: (document.getElementById('nombre') as HTMLInputElement).value.trim(),

          apellidoPaterno: (
            document.getElementById('apellidoPaterno') as HTMLInputElement
          ).value.trim(),

          apellidoMaterno: (
            document.getElementById('apellidoMaterno') as HTMLInputElement
          ).value.trim(),

          username: (document.getElementById('username') as HTMLInputElement).value.trim(),

          password: (document.getElementById('password') as HTMLInputElement).value,

          passwordConfirmar: (document.getElementById('passwordConfirmar') as HTMLInputElement)
            .value,

          email: (document.getElementById('email') as HTMLInputElement).value.trim(),

          telefono: (document.getElementById('telefono') as HTMLInputElement).value.trim(),

          celular: (document.getElementById('celular') as HTMLInputElement).value.trim(),

          rol: this.selectedRol,

          activo: 1,
        };

        let valido = true;

        if (!usuario.nombre) {
          mostrarError('nombre', 'errorNombre', 'El nombre es obligatorio');
          valido = false;
        }

        if (!usuario.apellidoPaterno) {
          mostrarError(
            'apellidoPaterno',
            'errorApellidoPaterno',
            'El apellido paterno es obligatorio',
          );
          valido = false;
        }

        if (!usuario.username) {
          mostrarError('username', 'errorUsername', 'El usuario es obligatorio');
          valido = false;
        }

        if (!usuario.password) {
          mostrarError('password', 'errorPassword', 'La contraseña es obligatoria');
          valido = false;
        } else if (usuario.password.length < 8) {
          mostrarError('password', 'errorPassword', 'Debe tener al menos 8 caracteres');
          valido = false;
        }

        if (!usuario.passwordConfirmar) {
          mostrarError(
            'passwordConfirmar',
            'errorPasswordConfirmar',
            'Debe confirmar la contraseña',
          );
          valido = false;
        }

        if (
          usuario.password &&
          usuario.passwordConfirmar &&
          usuario.password !== usuario.passwordConfirmar
        ) {
          mostrarError(
            'passwordConfirmar',
            'errorPasswordConfirmar',
            'Las contraseñas no coinciden',
          );
          valido = false;
        }

        if (!usuario.telefono) {
          mostrarError('telefono', 'errorTelefono', 'El teléfono es obligatorio');
          valido = false;
        }

        if (!usuario.celular) {
          mostrarError('celular', 'errorCelular', 'El celular es obligatorio');
          valido = false;
        }

        if (!usuario.email) {
          mostrarError('email', 'errorEmail', 'El correo es obligatorio');
          valido = false;
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

          if (!emailRegex.test(usuario.email)) {
            mostrarError('email', 'errorEmail', 'Ingrese un correo válido');
            valido = false;
          }
        }

        if (!usuario.rol) {
          mostrarError('rol', 'errorRol', 'Debe seleccionar un rol');
          valido = false;
        }

        if (!valido) {
          return false;
        }

        return usuario;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        console.log(result.value);

        this.addUser(result.value).subscribe({
          next: (result) => {
            if (result.correct) {
              Swal.fire({
                icon: 'success',
                title: 'Usuario creado',
                text: 'El usuario se registró correctamente',
              });
            } else {
              Swal.fire('Error', 'Algo salió mal, el usuario no se pudo guardar.', 'error');
            }
          },
          error: (err) => {
            Swal.fire(
              'Error',
              'Algo salió mal, el usuario no se pudo guardar, error del servidor.',
              'error',
            );
          },
        });
      }
    });
  }
}
