import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { EstadoTicket } from '../Interfaces/estado-ticket';
import { Result } from '../Interfaces/result';

@Injectable({
  providedIn: 'root',
})
export class EstadoService {
  apiUrl = environment.apiUrl;

  private http = inject(HttpClient);

  getAllEstados(): Observable<Result<EstadoTicket[]>> {
    return this.http.get<Result<EstadoTicket[]>>(this.apiUrl + '/Estado');
  }

  updateEstado(estadoTicket: EstadoTicket): Observable<Result<EstadoTicket>> {
    return this.http.post<Result<EstadoTicket>>(this.apiUrl + '/Estado', estadoTicket );
  }
}
