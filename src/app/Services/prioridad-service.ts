import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Prioridad } from '../Interfaces/prioridad';
import { Result } from '../Interfaces/result';

@Injectable({
  providedIn: 'root',
})
export class PrioridadService {
  apiEndpoint = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getAll(): Observable<Result<Prioridad>>{
    return this.http.get<Result<Prioridad>>(this.apiEndpoint+'/Prioridad');
  }
}
