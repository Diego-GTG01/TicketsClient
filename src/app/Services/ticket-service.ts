import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Result } from '../Interfaces/result';
import { Ticket } from '../Interfaces/ticket';

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  apiEndpoint = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllTickets(): Observable<Result<Ticket>> {
    return this.http.get<Result<Ticket>>(this.apiEndpoint + '/tickets/getAll');
  }
  getAllTicketsByUsuarioSolicitado(idUsuario: number): Observable<Result<Ticket>> {
    return this.http.get<Result<Ticket>>(
      this.apiEndpoint + '/tickets/ByUsuarioSolicitado?idUsuario=' + idUsuario,
    );
  }
  getAllTicketsByAgenteAsignado(idUsuario: number): Observable<Result<Ticket>> {
    return this.http.get<Result<Ticket>>(
      this.apiEndpoint + '/tickets/ByAgenteAsignado?idUsuario=' + idUsuario,
    );
  }

  getById(idTicket: number): Observable<Result<Ticket>> {
    return this.http.get<Result<Ticket>>(this.apiEndpoint + '/tickets?idTicket=' + idTicket);
  }

  addTicket(ticket: Ticket): Observable<Result<Ticket>> {
    return this.http.post<Result<Ticket>>(this.apiEndpoint + '/tickets', ticket);
  }

  updateAgente(idTicket: number, idAgente: number): Observable<Result<Ticket>> {
    return this.http.patch<Result<Ticket>>(
      this.apiEndpoint + '/tickets/assignTo?idTicket=' + idTicket + '&idAgenteAsignado=' + idAgente,
      null,
    );
  }

  updateEstado(ticket: Ticket): Observable<Result<Ticket>> {
    return this.http.patch<Result<Ticket>>(
      this.apiEndpoint + '/tickets/estado?idTicket=' + ticket.idTicket + '&estado=' + ticket.estado?.idEstado,
      null,
    );
  }

  updateStatus(idTicket: number, status: number): Observable<Result<Ticket>> {
    return this.http.patch<Result<Ticket>>(
      this.apiEndpoint + '/tickets/status?idTicket=' + idTicket + '&status=' + status,
      null,
    );
  }

  updatePrioridad(idTicket: number, prioridad: number): Observable<Result<Ticket>> {
    return this.http.patch<Result<Ticket>>(
      this.apiEndpoint + '/tickets/prioridad?idTicket=' + idTicket + '&idPrioridad=' + prioridad,
      null,
    );
  }
}
