import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lpazgjfnfqidjyfuikve.supabase.co'; // Reemplaza con tu URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwYXpnamZuZnFpZGp5ZnVpa3ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc4Mjk3ODMsImV4cCI6MjA0MzQwNTc4M30.uuwrZUptN-IO4za7wHo9LuUg2DfLSe5FoO2_oLfGd30'; // Reemplaza con tu clave de API
const supabaseClient: SupabaseClient = createClient(supabaseUrl, supabaseKey);

@Injectable({
  providedIn: 'root'
})

export class DisponibilidadService {

  constructor() { }

  // Método para agregar disponibilidad
  async agregarDisponibilidad(profesional_id: number, fecha: string, horaInicio: string, horaFin: string) {
    try {
      const { data, error } = await supabaseClient
        .from('disponibilidad')
        .insert([
          {
            profesional_id,     // Debe ser un número
            fecha,              // Tipo 'date', formato 'YYYY-MM-DD'
            hora_inicio: horaInicio, // Tipo 'time', formato 'HH:mm:ss'
            hora_fin: horaFin,       // Tipo 'time', formato 'HH:mm:ss'
            estado: 'disponible',    // Estado predeterminado como 'disponible'
          },
        ]);
  
      if (error) {
        console.error('Error al insertar disponibilidad:', error.message);
        return { data: null, error };
      }
  
      console.log('Disponibilidad insertada correctamente:', data);
      return { data, error: null };
    } catch (err) {
      console.error('Error inesperado al agregar disponibilidad:', err);
      return { data: null, error: err };
    }
  }
  
  // Método para obtener disponibilidad
  async obtenerDisponibilidad(profesional_id: number) {
    const { data, error } = await supabaseClient
      .from('disponibilidad')
      .select('*')
      .eq('profesional_id', profesional_id)
      .order('fecha', { ascending: true });

    if (error) {
      console.error('Error al obtener disponibilidad:', error.message);
      return { data: null, error };
    }

    return { data, error: null };
  }

  async cambiarEstadoDisponibilidad(disponibilidadId: number, nuevoEstado: string) {
    try {
      const { data, error } = await supabaseClient
        .from('disponibilidad')
        .update({ estado: nuevoEstado })
        .match({ disponibilidad_id: disponibilidadId });
  
      if (error) {
        return { error };  // Devolver el error si existe
      }
  
      return { data };  // Devolver los datos si no hay error
    } catch (err: unknown) {
      // Comprobar si el error es una instancia de Error
      if (err instanceof Error) {
        return { error: err.message };  // Devolver el mensaje de error si es una instancia de Error
      } else {
        console.error('Error desconocido:', err);
        return { error: 'Error desconocido' };  // Manejar el caso donde el error no sea una instancia de Error
      }
    }
  }
  
    // Método para modificar disponibilidad
async modificarDisponibilidad(disponibilidad_id: number, fecha: string, horaInicio: string, horaFin: string) {
  try {
    // Validar los parámetros antes de realizar la consulta
    if (!disponibilidad_id || !fecha || !horaInicio || !horaFin) {
      throw new Error('Todos los campos son obligatorios');
    }

    // Realizar la consulta a Supabase
    const { data, error } = await supabaseClient
      .from('disponibilidad')
      .update({
        fecha, 
        hora_inicio: horaInicio, 
        hora_fin: horaFin
      })
      .eq('disponibilidad_id', disponibilidad_id);

    // Manejo de errores en la consulta
    if (error) {
      console.error('Error al modificar disponibilidad:', error.message);
      return { data: null, error: error.message };
    }

    // Retornar datos si la operación fue exitosa
    return { data, error: null };
  } catch (error: any) {
    console.error('Error en modificarDisponibilidad:', error.message);
    return { data: null, error: error.message };
  }
}

  // Método para obtener el ID del profesional
  async obtenerProfesionalId(usuario_id: string): Promise<number | null> {
    const { data, error } = await supabaseClient
      .from('profesionales') // Consulta la tabla de profesionales
      .select('profesional_id')
      .eq('usuario_id', usuario_id) // Filtrar por el usuario_id
      .single(); // Esperamos un solo resultado
  
    if (error || !data) {
      console.error('Error al obtener profesional_id:', error?.message);
      return null; // Devuelve null si no encuentra el profesional
    }
    
    return data.profesional_id; // Asegúrate de que esto es un número
  }
}
