import { Component, OnInit } from '@angular/core';
import { UserService } from '../../Services/user-service';
import { Usuario } from '../../Interfaces/usuario';
import { CommonModule } from '@angular/common'; // <-- Importante
import Swal from 'sweetalert2';

@Component({
  selector: 'app-vista-usuarios',
  standalone: true, // <-- Aseguramos que esté marcado como standalone
  imports: [CommonModule], // <-- Añadido aquí
  templateUrl: './vista-usuarios.html',
  styleUrl: './vista-usuarios.css',
})
export class VistaUsuarios implements OnInit {
  usuarios: Usuario[] = [];

  constructor(private usuarioService: UserService) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.usuarioService.getAllUsers().subscribe({
      next: (result) => {
        if (result.correct) {
          // Si tu backend devuelve las propiedades dentro de 'objects' directamente
          this.usuarios = result.objects;
          
          Swal.fire(
            '¡Éxito!',
            'Se han obtenido todos los usuarios correctamente.',
            'success',
          );
        } else {
          Swal.fire('Error', 'Algo salió mal, no se pudo traer a los usuarios.', 'error');
        }
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        Swal.fire('Error', 'Error de conexión con el servidor.', 'error');
      },
    });
  }
}