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

  async agregarDisponibilidad(profesional_id: number, fecha: string, hora_inicio: string, hora_fin: string) {
    const { data, error } = await supabaseClient
      .from('Disponibilidad')
      .insert([{ profesional_id, fecha, hora_inicio, hora_fin }]);
    return { data, error };
  }

  async obtenerDisponibilidad(profesional_id: number) {
    const { data, error } = await supabaseClient
      .from('Disponibilidad')
      .select('*')
      .eq('profesional_id', profesional_id)
      .order('fecha', { ascending: true });
    return { data, error };
  }
   // Método para suspender un horario
   async suspenderDisponibilidad(disponibilidad_id: number) {
    const { data, error } = await supabaseClient
      .from('Disponibilidad')
      .update({ estado: 'suspendido' })
      .eq('disponibilidad_id', disponibilidad_id);
    return { data, error };
  }

  // Método para modificar un horario
  async modificarDisponibilidad(disponibilidad_id: number, fecha: string, horaInicio: string, horaFin: string) {
    const { data, error } = await supabaseClient
      .from('Disponibilidad')
      .update({ fecha, hora_inicio: horaInicio, hora_fin: horaFin })
      .eq('disponibilidad_id', disponibilidad_id);
    return { data, error };
  }
}

