import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { LoginResponse } from '../Interfaces/loginResponse';
import { Result } from '../Interfaces/result';
import { UsuarioLogin } from '../Interfaces/usuario-login';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  apiUrl= environment.apiUrl;


  private http = inject(HttpClient)

  login(usuarioLogin: UsuarioLogin):Observable<Result<LoginResponse>>{
    return this.http.post<Result<LoginResponse>>(this.apiUrl+'/auth/login', usuarioLogin);
  }
  
}
