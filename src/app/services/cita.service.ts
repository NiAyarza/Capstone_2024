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
}
