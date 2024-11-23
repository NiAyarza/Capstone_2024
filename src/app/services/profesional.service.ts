import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lpazgjfnfqidjyfuikve.supabase.co'; // Reemplaza con tu URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwYXpnamZuZnFpZGp5ZnVpa3ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc4Mjk3ODMsImV4cCI6MjA0MzQwNTc4M30.uuwrZUptN-IO4za7wHo9LuUg2DfLSe5FoO2_oLfGd30'; // Reemplaza con tu clave de API
const supabaseClient: SupabaseClient = createClient(supabaseUrl, supabaseKey);
@Injectable({
  providedIn: 'root',
})
export class ProfesionalService {
  constructor() {}

  async obtenerProfesionalesCercanos(lat: number, lng: number, distanciaKm: number, especialidad?: string) {
    const { data, error } = await supabaseClient
      .from('usuarios')
      .select('usuario_id, nombre, direccion, tipo_usuario, profesionales(especialidad, experiencia)')
      .filter('tipo_usuario', 'eq', 'profesional');
    
    if (error) {
      console.error('Error al obtener profesionales:', error);
      return [];
    }
  
    console.log('Datos obtenidos de Supabase:', data); // Verifica los datos antes de filtrar
  
    // Filtrar por distancia y especialidad
    return data.filter((usuario: any) => {
      const [latUsuario, lngUsuario] = this.parseDireccion(usuario.direccion);
      const distancia = this.calcularDistancia(lat, lng, latUsuario, lngUsuario);
  
      const cumpleEspecialidad = especialidad ? usuario.profesionales?.especialidad === especialidad : true;
  
      return distancia <= distanciaKm && cumpleEspecialidad;
    });
  }
  
  
  
  // Métodos auxiliares
  
  private parseDireccion(direccion: string): [number, number] {
    const [lat, lng] = direccion.split(',').map(coord => parseFloat(coord.trim()));
    if (isNaN(lat) || isNaN(lng)) {
      console.error('Error al parsear la dirección:', direccion);
      return [0, 0]; // Valores predeterminados
    }
    return [lat, lng];
  }
  
  private calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    
    console.log(`Cálculo de distancia: lat1=${lat1}, lon1=${lon1}, lat2=${lat2}, lon2=${lon2}`);
  
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distancia = R * c;
  
    console.log(`Distancia calculada: ${distancia} km`);
    
    return distancia;
  }
  
  
  private toRad(value: number): number {
    return (value * Math.PI) / 180;
  }

  async obtenerPerfil(usuarioId: string): Promise<any> {
    try {
      // Consulta combinada para profesionales y usuarios
      const { data, error } = await supabaseClient
        .from('profesionales')
        .select(`
          profesional_id,
          especialidad,
          experiencia,
          calificacion,
          estado,
          usuarios:usuario_id (
            usuario_id,
            nombre,
            telefono,
            direccion
          )
        `)
        .eq('usuario_id', usuarioId)
        .single();
  
      if (error) {
        if (error.code === 'PGRST116') {
          console.error('No se encontró al profesional con el ID:', usuarioId);
          throw new Error('Profesional no encontrado');
        }
        throw error;
      }
  
      // Asegurar que los datos del usuario están presentes
      if (!data || !data.usuarios) {
        throw new Error('No se pudo cargar la información del usuario');
      }
  
      // Combina los datos para devolver un objeto plano
      const perfil = {
        profesional_id: data.profesional_id,
        especialidad: data.especialidad,
        experiencia: data.experiencia,
        calificacion: data.calificacion,
        estado: data.estado,
        ...data.usuarios, // Agrega los datos de usuario como parte del objeto principal
      };
  
      return perfil;
    } catch (error) {
      console.error('Error al obtener el perfil:', error);
      throw error;
    }
  }
  
  
}
