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
    this.authService.login(this.usuario).subscribe({
      next: (result) => {
        if (result.correct) {
          console.log(result);
          this.router.navigate(['/tickets']);
        } else {
          this.error = result.message || 'Usuario o contraseña incorrectos';
        }
      },
      error: (err) => {
        console.error(err);
        this.error = 'Ocurrió un error en el servidor.';
      },
    });
  }

  crearUsuario(){
    this.usuarioService.crearUsuario();
  }


}
