import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Result } from '../Interfaces/result';
import { Rol } from '../Interfaces/rol';

@Injectable({
  providedIn: 'root',
})
export class RolService {
  apiUrl = environment.apiUrl;

  private http = inject(HttpClient);

  getAll(): Observable<Result<Rol>> {
    return this.http.get<Result<Rol>>(this.apiUrl+'/Rol');
  }
}
