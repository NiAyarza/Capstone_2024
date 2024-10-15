import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  loginData = {
    correo: '',
    contrasenia: ''
  };

  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  async login() {
    const { correo, contrasenia } = this.loginData;
    const response = await this.authService.signIn(correo, contrasenia);

    if (response.error) {
      this.errorMessage = 'Error de inicio de sesión: ' + response.error;
    } else if (response.user) {
      this.router.navigate(['/dashboard']);
    }
  }

  // Tipo específico para el evento
  handleInputChange(event: Event) {
    const target = event.target as HTMLInputElement; // Aseguramos que target es un HTMLInputElement
    const { name, value } = target;
    if (name in this.loginData) {
      this.loginData[name as keyof typeof this.loginData] = value;
    }
  }

  goToRegister() {
    this.router.navigate(['/registro']); // Cambia la ruta a la página de registro
  }

  // Navegación a la página de recuperación de contraseña
  navigateToRecoverPassword() {
    this.router.navigate(['/recover-password']);
  }
}