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

  constructor(private navCtrl: NavController,private authService: AuthService, private router: Router, private modalCtrl: ModalController, private loadingCtrl: LoadingController) {} // Inyecta Router

  async abrirMapa() {
    // Validar si los campos de calle, número y comuna están llenos
    if (!this.formData.calle || !this.formData.numero || !this.formData.comuna) {
      alert('Por favor, completa los campos de Calle, Número y Comuna antes de abrir el mapa.');
      return;
    }
  
    const address = `${this.formData.calle} ${this.formData.numero}, ${this.formData.comuna}, Chile`;
  
    const modal = await this.modalCtrl.create({
      component: MapModalComponent,
      componentProps: { address }, // Pasar la dirección al componente del modal
    });
  
    // Presentar el modal
    await modal.present();
  
    const { data } = await modal.onWillDismiss();
  
    // Guardar las coordenadas seleccionadas
    if (data) {
      this.formData.direccion = `${data.lat}, ${data.lng}`;
    }
  }
  
  
  
  async handleSubmit() {
    // Validar que todos los campos obligatorios están presentes
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
        calificacion: this.formData.calificacion!, // Asegúrate de que sea un número
        experiencia: this.formData.experiencia!,
        estado: 'activo', // Puedes establecer un estado por defecto si es necesario
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
}
