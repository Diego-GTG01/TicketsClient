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

  getAllTickets(): Observable<Result<Ticket>>{
    return this.http.get<Result<Ticket>>(this.apiEndpoint+'/tickets/getAll');
  }

  getById(idTicket: number): Observable<Result<Ticket>>{
    return this.http.get<Result<Ticket>>(this.apiEndpoint+'/tickets?idTicket='+ idTicket);
  }

  addTicket(ticket: Ticket):  Observable<Result<Ticket>>{
    return this.http.post<Result<Ticket>>(this.apiEndpoint+'/tickets', ticket);
  }

}
