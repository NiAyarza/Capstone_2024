import { Component } from '@angular/core';
import { AuthService, UserData } from '../services/auth.service';

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
    direccion: '',
    tipo_usuario: 'cliente',
    especialidad: '',
    experiencia: '',
  };

  constructor(private authService: AuthService) {}

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

    alert('Registro exitoso');
  }

  handleChange(event: any) {
    const { name, value } = event.target;
    this.formData[name as keyof UserData] = value;
  }
}
