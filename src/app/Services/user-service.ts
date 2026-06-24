import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Usuario } from '../Interfaces/usuario';
import { Result } from '../Interfaces/result';
@Injectable({
  providedIn: 'root',
})
export class UserService {
  apiUrl = environment.apiUrl + '/Usuario';

  private http = inject(HttpClient);
  getAllUsersByRol(agente: string): Observable<Result<Usuario>> {
    return this.http.get<Result<Usuario>>(this.apiUrl + '/byRol?nombre=' + agente);
  }

  getAllUsers(): Observable<Result<Usuario>>{
    return this.http.get<Result<Usuario>>(this.apiUrl)
  }

}
