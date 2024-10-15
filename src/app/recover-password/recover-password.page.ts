import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { AuthError } from '@supabase/supabase-js'; // Asegúrate de importar AuthError

@Component({
  selector: 'app-recover-password',
  templateUrl: './recover-password.page.html',
  styleUrls: ['./recover-password.page.scss'],
})
export class RecoverPasswordPage {
  email: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController
  ) {}

  async sendPasswordResetEmail() {
    const response = await this.authService.sendPasswordReset(this.email);

    // Verificar si hubo un error
    const error = response.error;

    if (error) {
      // Aquí estamos asegurando que error sea un string
      const errorMessage = typeof error === 'string' ? error : error.message || 'Error desconocido';
      this.showAlert('Error', errorMessage);
    } else {
      this.showAlert('Correo enviado', `Se ha enviado un enlace de recuperación a ${this.email}`, true);
    }
  }

  async showAlert(header: string, message: string, redirectToLogin: boolean = false) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: [
        {
          text: 'OK',
          handler: () => {
            if (redirectToLogin) {
              this.router.navigate(['/login']);
            }
          },
        },
      ],
    });

    await alert.present();
  }
}
