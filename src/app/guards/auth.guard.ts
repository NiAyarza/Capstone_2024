import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Asegúrate de ajustar la ruta según tu estructura

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const isAuthenticated = this.authService.checkAuthenticated(); // Método para verificar autenticación
    if (!isAuthenticated) {
      this.router.navigate(['/login']); // Redirigir si no está autenticado
    }
    return isAuthenticated; // Permitir o denegar acceso
  }
}
