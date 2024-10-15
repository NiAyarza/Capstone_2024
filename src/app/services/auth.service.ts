import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, AuthResponse } from '@supabase/supabase-js';
import * as bcrypt from 'bcryptjs';

const supabaseUrl = 'https://lpazgjfnfqidjyfuikve.supabase.co';
const supabaseKey = 'YOUR_SUPABASE_KEY'; // Reemplaza con tu clave de API
const supabaseClient: SupabaseClient = createClient(supabaseUrl, supabaseKey);

export interface UserData {
  nombre: string;
  correo: string;
  contrasenia: string;
  confirmar_contrasenia?: string;
  telefono: string;
  direccion: string;
  tipo_usuario: 'cliente' | 'profesional';
  especialidad?: string;
  calificacion?: number;
  experiencia?: string;
  estado?: 'activo' | 'inactivo';
}

export interface ProfessionalData {
  usuario_id: number;
  especialidad: 'peluquería_personas' | 'peluquería_mascotas';
  calificacion?: number;
  experiencia?: string;
  estado: 'activo' | 'inactivo';
}

interface ChangePasswordResponse {
  success?: boolean;
  error?: { message: string };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Método de registro de usuario
  async registerUser(userData: UserData) {
    const { nombre, correo, contrasenia, telefono, direccion, tipo_usuario } = userData;

    // Hasheamos la contraseña
    const hashedPassword = bcrypt.hashSync(contrasenia, 10);

    // Registro del usuario en Supabase
    const { error: userError }: AuthResponse = await supabaseClient.auth.signUp({
      email: correo,
      password: hashedPassword,
    });

    if (userError) {
      console.error('Error al registrar el usuario:', userError.message);
      return { error: userError.message };
    }

    // Inserción de datos del usuario en la tabla 'usuarios'
    const { data, error } = await supabaseClient
      .from('usuarios')
      .insert([{
        nombre,
        correo,
        contraseña: hashedPassword,
        telefono,
        direccion,
        tipo_usuario,
        fecha_creacion: new Date(),
      }])
      .select();

    if (error) {
      console.error('Error al insertar en la tabla usuarios:', error.message);
      return { error: error.message };
    }

    // Retornamos el usuario creado y su ID
    return { user: data[0] }; // Retornamos el primer elemento del array
  }

  async registerProfessional(professionalData: ProfessionalData) {
    const { usuario_id, especialidad, calificacion, experiencia, estado } = professionalData;

    // Inserción de datos del profesional en la tabla 'profesionales'
    const { data, error } = await supabaseClient
      .from('profesionales')
      .insert([{
        usuario_id,
        especialidad,
        calificacion,
        experiencia,
        estado,
        fecha_registro: new Date(),
      }]);

    if (error) {
      console.error('Error al insertar en la tabla profesionales:', error.message);
      return { error: error.message };
    }

    return { professional: data };
  }

  // Método de inicio de sesión
  async signIn(email: string, password: string) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Error al iniciar sesión:', error.message);
      return { error: error.message };
    }

    return { user: data.user }; // Asegúrate de acceder a data.user
  }

  // Método para cambiar la contraseña
  async changePassword(newPassword: string) {
    // Asegúrate de que el usuario esté autenticado
    const { data, error } = await supabaseClient.auth.getUser();

    if (error || !data?.user) {
      return { error: 'El usuario no está autenticado.' };
    }

    // Actualiza la contraseña del usuario autenticado
    const { error: updateError } = await supabaseClient.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      return { error: updateError.message };
    }

    return { success: true };
  }

  async sendPasswordReset(email: string) {
    // Verificar si el correo existe en la base de datos
    const { data, error: fetchError } = await supabaseClient
      .from('usuarios')
      .select('correo')
      .eq('correo', email)
      .single(); // Obtiene un único registro
  
    if (fetchError || !data) {
      return { error: 'El correo no está registrado.' };
    }
  
    // Si el correo existe, enviar el enlace de recuperación
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email);
    return { error };
  }

  async confirmPasswordReset(newPassword: string): Promise<ChangePasswordResponse> {
    const { data, error } = await supabaseClient.auth.getUser();
  
    if (error || !data?.user) {
      return { error: { message: 'El usuario no está autenticado.' } };
    }
  
    const { error: updateError } = await supabaseClient.auth.updateUser({
      password: newPassword,
    });
  
    if (updateError) {
      return { error: { message: updateError.message } }; // Asegúrate de que el error sea un objeto con mensaje
    }
  
    return { success: true };
  }
}
