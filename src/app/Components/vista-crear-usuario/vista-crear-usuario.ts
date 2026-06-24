import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-vista-crear-usuario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './vista-crear-usuario.html',
  styleUrl: './vista-crear-usuario.css',
})
export class VistaCrearUsuario {

  usuarioForm: FormGroup;

  roles = [
    { idRol: 1, nombre: 'Administrador' },
    { idRol: 2, nombre: 'Soporte' },
    { idRol: 3, nombre: 'Usuario' }
  ];

  constructor(private fb: FormBuilder) {

    this.usuarioForm = this.fb.group({
      nombre: ['', Validators.required],
      apellidoPaterno: ['', Validators.required],
      apellidoMaterno: [''],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: [''],
      celular: [''],
      rol: [null, Validators.required],
      activo: [1]
    });
  }

  abrirModalUsuario(): void {

    Swal.fire({
      title: 'Crear Usuario',
      width: '700px',
      html: `
        <div class="row g-2 text-start">

          <div class="col-md-6">
            <label>Nombre</label>
            <input id="nombre" class="swal2-input">
          </div>

          <div class="col-md-6">
            <label>Apellido Paterno</label>
            <input id="apellidoPaterno" class="swal2-input">
          </div>

          <div class="col-md-6">
            <label>Apellido Materno</label>
            <input id="apellidoMaterno" class="swal2-input">
          </div>

          <div class="col-md-6">
            <label>Usuario</label>
            <input id="username" class="swal2-input">
          </div>

          <div class="col-md-6">
            <label>Email</label>
            <input id="email" type="email" class="swal2-input">
          </div>

          <div class="col-md-6">
            <label>Teléfono</label>
            <input id="telefono" class="swal2-input">
          </div>

          <div class="col-md-6">
            <label>Celular</label>
            <input id="celular" class="swal2-input">
          </div>

          <div class="col-md-6">
            <label>Rol</label>
            <select id="rol" class="swal2-select">
              <option value="">Seleccione...</option>
              ${this.roles.map(r =>
                `<option value="${r.idRol}">${r.nombre}</option>`
              ).join('')}
            </select>
          </div>

        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',

      preConfirm: () => {

        const usuario = {
          nombre: (document.getElementById('nombre') as HTMLInputElement).value,
          apellidoPaterno: (document.getElementById('apellidoPaterno') as HTMLInputElement).value,
          apellidoMaterno: (document.getElementById('apellidoMaterno') as HTMLInputElement).value,
          username: (document.getElementById('username') as HTMLInputElement).value,
          email: (document.getElementById('email') as HTMLInputElement).value,
          telefono: (document.getElementById('telefono') as HTMLInputElement).value,
          celular: (document.getElementById('celular') as HTMLInputElement).value,
          rol: Number((document.getElementById('rol') as HTMLSelectElement).value),
          activo: 1
        };

        if (
          !usuario.nombre ||
          !usuario.apellidoPaterno ||
          !usuario.username ||
          !usuario.email ||
          !usuario.rol
        ) {
          Swal.showValidationMessage(
            'Nombre, Apellido, Usuario, Email y Rol son obligatorios'
          );
          return false;
        }

        return usuario;
      }
    }).then((result) => {

      if (result.isConfirmed) {

        console.log(result.value);

        // Aquí llamarías tu servicio
        // this.usuarioService.crear(result.value).subscribe(...)

        Swal.fire({
          icon: 'success',
          title: 'Usuario creado',
          text: 'El usuario se registró correctamente'
        });
      }
    });
  }
}