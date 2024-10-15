// change-password.page.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.page.html',
  styleUrls: ['./change-password.page.scss'],
})
export class ChangePasswordPage {
  newPassword: string = '';
  confirmPassword: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  async changePassword() {
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    // Llama al servicio y maneja el resultado
    const errorMessage = await this.authService.changePassword(this.newPassword);

    if (errorMessage) {
      this.errorMessage = 'Error al cambiar la contraseña: ' + errorMessage; // Cambia aquí
    } else {
      // Redirigir al inicio de sesión si no hay errores
      this.router.navigate(['/login']);
    }
  }
}
