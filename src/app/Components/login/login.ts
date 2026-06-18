import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UsuarioLogin } from '../../Interfaces/usuario-login';
import { LoginResponse } from '../../Interfaces/loginResponse';
import { AuthService } from '../../Services/auth-service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  usuario: UsuarioLogin = {
    username: '',
    password: '',
  };

  error = '';

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  login(): void {
    this.authService.login(this.usuario).subscribe({
      next: (result) => {
        if (result.correct) {
          console.log(result)
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
}
