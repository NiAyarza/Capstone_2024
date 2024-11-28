import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lpazgjfnfqidjyfuikve.supabase.co'; // Reemplaza con tu URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwYXpnamZuZnFpZGp5ZnVpa3ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc4Mjk3ODMsImV4cCI6MjA0MzQwNTc4M30.uuwrZUptN-IO4za7wHo9LuUg2DfLSe5FoO2_oLfGd30'; // Reemplaza con tu clave de API
const supabaseClient: SupabaseClient = createClient(supabaseUrl, supabaseKey);

@Injectable({
  providedIn: 'root'
})
export class CitaService {

  constructor() { }



  // Cambiar el estado de una cita
  async actualizarEstadoCita(cita_id: number, estado: string) {
    try {
      const { data, error } = await supabaseClient
        .from('citas')
        .update({ estado })
        .eq('cita_id', cita_id); // Actualizamos el estado de la cita por su ID

      if (error) {
        console.error('Error al actualizar el estado de la cita:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error al actualizar el estado de la cita:', error);
      return null;
    }
  }

  async agendarCita(cita: any) {
    try {
      const { data, error } = await supabaseClient
        .from('citas')
        .insert([cita]);  // Insertamos una nueva cita

      if (error) {
        console.error('Error al agendar la cita:', error);
        return { error };
      }

      return { data };
    } catch (error) {
      console.error('Error al agendar la cita:', error);
      return { error };
    }
  }

  async obtenerCitasPorProfesional(profesionalId: number): Promise<any> {
    const { data, error } = await supabaseClient
      .from('citas')
      .select(`
        cita_id,
        usuario_id,
        profesional_id,
        fecha_hora,
        estado,
        usuarios (nombre, direccion, telefono)
      `)
      .eq('profesional_id', profesionalId);
  
    if (error) {
      console.error('Error al obtener citas:', error);
      return { data: [] }; // Devuelve un objeto con un campo 'data' vacío
    }
  
    return { data };
  }
  

  // Obtener las citas para un usuario
async obtenerCitasPorUsuario(usuarioId: number) {
  try {
    const { data, error } = await supabaseClient
      .from('citas')
      .select('*')
      .eq('usuario_id', usuarioId);

    if (error) {
      console.error('Error al obtener citas para el usuario:', error);
      return [];
    }

    return data || [];  // Devuelve los datos de las citas o un arreglo vacío
  } catch (error) {
    console.error('Error al obtener citas para el usuario:', error);
    return [];
  }
}


  
}
