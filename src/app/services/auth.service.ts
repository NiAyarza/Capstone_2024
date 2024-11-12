import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, AuthResponse } from '@supabase/supabase-js';
import * as bcrypt from 'bcryptjs';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';



const supabaseUrl = 'https://lpazgjfnfqidjyfuikve.supabase.co'; // Reemplaza con tu URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwYXpnamZuZnFpZGp5ZnVpa3ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc4Mjk3ODMsImV4cCI6MjA0MzQwNTc4M30.uuwrZUptN-IO4za7wHo9LuUg2DfLSe5FoO2_oLfGd30'; // Reemplaza con tu clave de API
const supabaseClient: SupabaseClient = createClient(supabaseUrl, supabaseKey);

export interface UserData {
  nombre: string;
  correo: string;
  contrasenia: string;
  confirmar_contrasenia?: string;
  telefono: string;
  calle: string;
  numero: string;
  comuna: string;
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

  public isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private router: Router) {}

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
        contrasenia: hashedPassword,
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
    // 1. Buscar el usuario por correo en la base de datos
    const { data: user, error: fetchError } = await supabaseClient
      .from('usuarios')
      .select('*')
      .eq('correo', email)
      .single();
  
    if (fetchError || !user) {
      console.error('Error al obtener el usuario:', fetchError?.message);
      return { error: 'El usuario no existe o hubo un error.' };
    }
  
    // 2. Comparar la contraseña ingresada con la almacenada en la base de datos
    const passwordMatch = bcrypt.compareSync(password, user.contrasenia);
  
    if (!passwordMatch) {
      return { error: 'Contraseña incorrecta' };
    }
  
    // 3. Si la contraseña es correcta, guardar el estado del usuario (logueado)
    localStorage.setItem('user', JSON.stringify(user)); // Guardar al usuario en localStorage
  
    // Guardar el tipo de usuario (cliente o profesional) en localStorage
    localStorage.setItem('userType', user.tipo_usuario); 
  
    this.isAuthenticatedSubject.next(true); // Cambiar el estado de autenticación a verdadero
    return { user };
  }

  getUserType(): string | null {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user ? user.tipo_usuario : null;
  }
  
  getUserId(): number | null {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user ? user.id : null;
  }

  checkAuthenticated(): boolean {
    return !!localStorage.getItem('user'); // Retorna verdadero si hay un usuario en localStorage
  }

  logout() {
    localStorage.removeItem('user'); // Eliminar usuario del localStorage
    this.isAuthenticatedSubject.next(false); // Cambiar el estado de autenticación
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
