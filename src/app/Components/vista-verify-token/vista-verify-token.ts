import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { CommonModule } from '@angular/common';
import { TokenService } from '../../Services/token-service';
import { VerificacionToken } from '../../Interfaces/verificacion-token';

@Component({
  selector: 'app-vista-verify-token',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vista-verify-token.html',
  styleUrl: './vista-verify-token.css',
})
export class VistaVerifyToken implements OnInit {
  tokenString: string | null = null;
  loading: boolean = true;
  errorExplicito: string | null = null;
  
  datosToken: VerificacionToken | null = null;

  constructor(
    private route: ActivatedRoute,
    private tokenService: TokenService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.tokenString = params.get('token');

      if (this.tokenString) {
        this.procesarVerificacion(this.tokenString);
      } else {
        this.loading = false;
        this.errorExplicito = 'No se proporcionó ningún token en la URL.';
      }
    });
  }

  private procesarVerificacion(token: string): void {
    this.loading = true;
    this.tokenService.verifyToken(token).subscribe({
      next: (res) => {
        if (res && res.correct) { 
          this.datosToken = res.object;
        } else {
          this.errorExplicito = 'El token no es válido o ya expiró.';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorExplicito = 'Ocurrió un error al conectar con el servidor.';
        this.loading = false;
      }
    });
  }
  volver(): void{
    this.router.navigate(['/'])
  }
}