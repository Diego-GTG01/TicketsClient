import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, of } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';
import { TokenService } from '../../Services/token-service';
import { VerificacionToken } from '../../Interfaces/verificacion-token';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-vista-verify-token',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vista-verify-token.html',
  styleUrl: './vista-verify-token.css',
})
export class VistaVerifyToken implements OnInit, OnDestroy {
  tokenString: string | null = null;
  loading = true;
  errorExplicito: string | null = null;
  datosToken: VerificacionToken | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private tokenService: TokenService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(
        tap(() => (this.loading = true)),
        switchMap((params) => {
          this.tokenString = params.get('token');

          if (!this.tokenString) {
            this.errorExplicito = 'No se proporcionó ningún token en la URL.';
            this.loading = false;
            Swal.fire({
              icon: 'error',
              title: 'Token Ausente',
              text: this.errorExplicito,
              confirmButtonColor: '#0d6efd'
            }).then(() => this.volver());
            return of(null);
          }

          return this.tokenService.verifyToken(this.tokenString);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res) => {
          if (!res) return;

          if (res.correct) {
            this.datosToken = res.object;
            this.errorExplicito = null;
            Swal.fire({
              icon: 'success',
              title: '¡Token Verificado!',
              text: 'La verificación del token se realizó con éxito.',
              showConfirmButton: false,
              timer: 1500
            }).then(() => this.volver());
          } else {
            this.errorExplicito = 'El token no es válido o ya expiró.';
            Swal.fire({
              icon: 'error',
              title: 'Token Inválido',
              text: this.errorExplicito,
              confirmButtonColor: '#0d6efd'
            }).then(() => this.volver());
          }
          this.loading = false;
        },
        error: (err) => {
          this.errorExplicito = 'Ocurrió un error al conectar con el servidor.';
          this.loading = false;
          Swal.fire({
            icon: 'error',
            title: 'Error de Conexión',
            text: this.errorExplicito,
            confirmButtonColor: '#0d6efd'
          }).then(() => this.volver());
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  volver(): void {
    this.router.navigate(['/']);
  }
}