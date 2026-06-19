import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, tap } from 'rxjs';
import { LoginResponse } from '../Interfaces/loginResponse';
import { Result } from '../Interfaces/result';
import { UsuarioLogin } from '../Interfaces/usuario-login';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  private userToken = signal<string | null>(sessionStorage.getItem('token'));
  private userRol = signal<string | null>(sessionStorage.getItem('rol'));
  private username = signal<string | null>(sessionStorage.getItem('username'));
  private idUsuario = signal<string | null>(sessionStorage.getItem('idUsuario'));

  login(usuarioLogin: UsuarioLogin): Observable<Result<LoginResponse>> {
    return this.http.post<Result<LoginResponse>>(`${this.apiUrl}/auth/login`, usuarioLogin).pipe(
      tap((response) => {
        if (response.correct && response.object) {
          console.log(response);
          this.userToken.set(response.object.token);
          this.userRol.set(response.object.rol);
          this.username.set(response.object.username);
          this.idUsuario.set(response.object.idUsuario.toString());

          sessionStorage.setItem('token', response.object.token);
          sessionStorage.setItem('rol', response.object.rol);
          sessionStorage.setItem('username', response.object.username);
          sessionStorage.setItem('idUsuario', response.object.idUsuario.toString());
        }
      }),
    );
  }

  getToken(): string | null {
    return this.userToken();
  }

  getUserRol(): string | null {
    return this.userRol();
  }

  getUsername(): string | null {
    return this.username();
  }
  getIdUsuario(): string | null {
    return this.idUsuario();
  }

  isAuthenticated(): boolean {
    return this.userToken() !== null;
  }

  logout(): void {
    this.userToken.set(null);
    this.userRol.set(null);
    this.username.set(null);
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('rol');
    sessionStorage.removeItem('username');
  }
}
