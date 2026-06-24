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

  crearUsuario(){
    this.usuarioService.crearUsuario();
  }

  
}
