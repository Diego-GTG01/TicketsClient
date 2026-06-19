import { HttpClient } from '@angular/common/http';
import { inject, Inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Result } from '../Interfaces/result';
import { Comentario } from '../Interfaces/comentario';

@Injectable({
  providedIn: 'root',
})
export class ComentarioService {
  apiUrl = environment.apiUrl;

  private http = inject(HttpClient);

  getComentarioByIdTicket(idTicket: number): Observable<Result<Comentario>>{
    return this.http.get<Result<Comentario>>(this.apiUrl+'/Comentario?idTicket='+idTicket);
  }

  addComentario(comentario: Comentario): Observable<Result<Comentario>>{
    return this.http.post<Result<Comentario>>(this.apiUrl+'/Comentario', comentario);
  }

}
