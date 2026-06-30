import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { VerificacionToken } from '../Interfaces/verificacion-token';
import { Observable } from 'rxjs';
import { Result } from '../Interfaces/result';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  apiUrl = environment.apiUrl + '/token';

  constructor(private readonly http: HttpClient) {}

  verifyToken(token: string): Observable<Result<VerificacionToken>> {
    return this.http.get<Result<VerificacionToken>>(this.apiUrl + '?token=' + token);
  }

  addToken(token: VerificacionToken): Observable<Result<VerificacionToken>> {
    return this.http.post<Result<VerificacionToken>>(this.apiUrl + '?token=', token);
  }
}
