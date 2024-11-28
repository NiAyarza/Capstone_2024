import { Component } from '@angular/core';
import { AuthService, UserData } from '../services/auth.service';
import { Router } from '@angular/router'; // Importa Router para redirigir
import { LoadingController, ModalController, NavController } from '@ionic/angular';
import { MapModalComponent } from '../map-modal/map-modal.component';
import { GeocodingService } from '../services/geocoding.service';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage {
  formData: Partial<UserData> = {
    nombre: '',
    correo: '',
    contrasenia: '',
    confirmar_contrasenia: '',
    telefono: '',
    calle: '',
    numero: '',
    comuna: '',
    direccion: '',
    tipo_usuario: 'cliente',
    especialidad: '',
    experiencia: '',
  };

  constructor(private navCtrl: NavController, private authService: AuthService, private router: Router, private modalCtrl: ModalController, private loadingCtrl: LoadingController) {}

  async abrirMapa() {
    if (!this.formData.calle || !this.formData.numero || !this.formData.comuna) {
      alert('Por favor, completa los campos de Calle, Número y Comuna antes de abrir el mapa.');
      return;
    }

    const address = `${this.formData.calle} ${this.formData.numero}, ${this.formData.comuna}, Chile`;

    const modal = await this.modalCtrl.create({
      component: MapModalComponent,
      componentProps: { address, fromPage: 'registro' },
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data) {
      this.formData.direccion = `${data.lat}, ${data.lng}`;
    }
  }

  async handleSubmit() {
    if (this.formData.contrasenia !== this.formData.confirmar_contrasenia) {
      alert('Las contraseñas no coinciden');
      return;
    }
  
    // Validar que todos los campos obligatorios estén presentes
    if (!this.formData.nombre || !this.formData.correo || !this.formData.contrasenia || !this.formData.telefono || !this.formData.direccion) {
      alert('Por favor, completa todos los campos obligatorios');
      return;
    }
  
    // Establecer calificación a 0 si es un profesional
    if (this.formData.tipo_usuario === 'profesional') {
      this.formData.calificacion = 0; // Establece la calificación por defecto
    }
  
    // Registro de usuario
    const { user, error: userError } = await this.authService.registerUser(this.formData as UserData);
    if (userError) {
      alert(userError);
      return;
    }
  
    // Si el usuario es un profesional, registrar los detalles adicionales
    if (this.formData.tipo_usuario === 'profesional') {
      const { error: professionalError } = await this.authService.registerProfessional({
        usuario_id: user.usuario_id, // Usamos el ID del usuario registrado
        especialidad: this.formData.especialidad as 'peluquería_personas' | 'peluquería_mascotas',
        calificacion: this.formData.calificacion!,
        experiencia: this.formData.experiencia!,
        estado: 'activo',
      });
  
      if (professionalError) {
        alert(professionalError);
        return;
      }
    }
  
    // Mostrar alerta de éxito y redirigir a login
    alert('Registro exitoso');
    this.router.navigate(['/login']); // Redirige a la página de login después del registro exitoso
  }

  handleChange(event: any) {
    const { name, value } = event.target;
    this.formData[name as keyof UserData] = value;
  }

  volver() {
    this.navCtrl.back();
  }

  // Asegura que el número comience con +56 y que solo se ingresen números después
  formatTelefono() {
    let telefono = this.formData.telefono || '';
    telefono = telefono.replace(/\D/g, ''); // Eliminar caracteres no numéricos
    if (telefono.length > 9) telefono = telefono.substring(0, 9); // Limitar a 9 caracteres
    if (!telefono.startsWith('56') && telefono.length === 9) telefono = '56' + telefono; // Agregar +56 si no está presente
    this.formData.telefono = `+${telefono}`;
  }
}

