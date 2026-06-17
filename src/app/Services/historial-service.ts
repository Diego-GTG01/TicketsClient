import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Result } from '../Interfaces/result';
import { Historial } from '../Interfaces/historial';

@Injectable({
  providedIn: 'root',
})
export class HistorialService {
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getHistorialById(idTicket: number): Observable<Result<Historial>>{
    return this.http.get<Result<Historial>>(this.apiUrl+'/Historial?idTicket='+idTicket);
  }
}
