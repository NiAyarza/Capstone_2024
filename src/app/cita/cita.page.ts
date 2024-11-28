import { Component, OnInit } from '@angular/core';
import { CitaService } from '../services/cita.service';
import { ProfesionalService } from '../services/profesional.service';
import { GeocodingService } from '../services/geocoding.service';

@Component({
  selector: 'app-cita',
  templateUrl: './cita.page.html',
  styleUrls: ['./cita.page.scss'],
})
export class CitaPage implements OnInit {

  citas: any[] = [];
  esProfesional: boolean = false;  // Determinar si el usuario es un profesional
  usuarioId: number = 0;           // Inicializamos como 0 para que se obtenga del localStorage
  profesionalId: number | null = null;

  constructor(
    private citasService: CitaService,
    private profesionalService: ProfesionalService,
    private geocodingService: GeocodingService
  ) {}

  async ngOnInit(): Promise<void> {
    // Obtener el tipo de usuario desde localStorage
    const userType = localStorage.getItem('userType');
    console.log('Tipo de usuario desde localStorage:', userType); // Verifica el valor
  
    this.esProfesional = userType === 'profesional';
    console.log('Es profesional:', this.esProfesional); // Verifica el valor de esProfesional
  
    // Obtener el ID del usuario desde localStorage
    this.usuarioId = parseInt(localStorage.getItem('userId') || '0');
  
    // Si es un profesional, obtener el profesional_id
    if (this.esProfesional) {
      try {
        const perfil = await this.profesionalService.obtenerPerfil(this.usuarioId.toString());
        this.profesionalId = perfil.profesional_id;  // Guardamos el profesional_id
        console.log('Perfil del profesional:', perfil);
      } catch (error) {
        console.error('Error al obtener el perfil del profesional:', error);
      }
    }
  
    // Obtener las citas
    await this.obtenerCitas();
  }
  

  // Función general para obtener las citas, tanto por usuario como por profesional
  async obtenerCitas() {
    try {
      // Si es un profesional, obtener las citas usando profesional_id
      if (this.esProfesional && this.profesionalId !== null) {
        const respuesta = await this.citasService.obtenerCitasPorProfesional(this.profesionalId);
        console.log('Citas obtenidas para el profesional:', respuesta);
        this.citas = Array.isArray(respuesta) ? respuesta : [];
      } else {
        // Si es un cliente, obtener las citas usando usuario_id
        const respuesta = await this.citasService.obtenerCitasPorUsuario(this.usuarioId);
        console.log('Citas obtenidas para el cliente:', respuesta);
        this.citas = Array.isArray(respuesta) ? respuesta : [];
      }
    } catch (error) {
      console.error('Error al obtener las citas:', error);
      this.citas = [];  // En caso de error, asigna un arreglo vacío
    }
  }

  async verCitasPorProfesional() {
    if (this.profesionalId !== null) {
      const respuesta = await this.citasService.obtenerCitasPorProfesional(this.profesionalId);
  
      if (respuesta && Array.isArray(respuesta.data)) {
        this.citas = await Promise.all(
          respuesta.data.map(async (cita: any) => {
            let direccionLegible = 'Cargando...';
  
            console.log('Cita actual:', cita);  // Imprimir cada cita
  
            // Verificar que el campo 'usuarios' existe y tiene una dirección
            if (cita.usuarios?.direccion) {
              // Primero parseamos la dirección para obtener latitud y longitud
              const [lat, lon] = this.parseDireccion(cita.usuarios.direccion);
              if (lat !== null && lon !== null) {
                try {
                  // Usamos el servicio de geocodificación para obtener la dirección legible
                  const direccion = await this.geocodingService.obtenerDireccion(lat, lon).toPromise();
                  direccionLegible = this.procesarDireccion(direccion.display_name);  // Guardamos la dirección legible
                } catch (error) {
                  console.error('Error al obtener la dirección legible:', error);
                  direccionLegible = 'No disponible';  // Si hay error, mostramos 'No disponible'
                }
              }
            }
            const mostrarTelefono = cita.estado === 'aceptada';
  
            // Devuelves la cita con los nuevos campos añadidos
            return {
              ...cita,
              usuario: cita.usuarios || {},  // Asegurarse de que la propiedad 'usuarios' se maneje correctamente
              direccionLegible,  // Agregamos la dirección legible
              mostrarTelefono,  // Campo para controlar si se muestra el teléfono
            };
          })
        );
        console.log('Citas asignadas con direcciones legibles:', this.citas);
      } else {
        console.error('Error: la respuesta no contiene datos válidos.', respuesta);
        this.citas = [];
      }
    }
  }
  

  // Método para procesar la dirección y obtener solo los primeros 3 elementos
  procesarDireccion(direccion: string): string {
    const partes = direccion.split(','); // Separar por coma
    if (partes.length >= 3) {
      return `${partes[1]}, ${partes[0]}, ${partes[3]}`; // Tomar los primeros tres elementos
    } else {
      return direccion; // En caso de que no haya suficientes partes
    }
  }
  
  
  // Función auxiliar para dividir la dirección en latitud y longitud
  parseDireccion(direccion: string): [number | null, number | null] {
    if (!direccion) return [null, null];
    const [lat, lon] = direccion.split(',').map(coord => parseFloat(coord.trim()));
    return [isNaN(lat) ? null : lat, isNaN(lon) ? null : lon];
  }
  
  // Función para ver las citas de un cliente
  async verCitasPorUsuario() {
    const respuesta = await this.citasService.obtenerCitasPorUsuario(this.usuarioId);
    console.log('Citas obtenidas para el cliente:', respuesta);
    this.citas = Array.isArray(respuesta) ? respuesta : [];
  }

  // Cambiar el estado de la cita a 'confirmado' solo si la cita pertenece al profesional
  async aceptarCita(cita: any) {
    try {
      // Actualiza el estado de la cita en la base de datos
      await this.citasService.actualizarEstadoCita(cita.cita_id, 'aceptada');
  
      // Actualiza localmente el estado y muestra el teléfono
      cita.estado = 'aceptada';
      cita.mostrarTelefono = true;
  
      console.log(`Cita ${cita.cita_id} aceptada.`);
    } catch (error) {
      console.error('Error al aceptar la cita:', error);
    }
  }

  // Obtener el enlace a Google Maps con la dirección
  abrirEnGoogleMaps(direccion: string) {
    const [lat, lon] = direccion.split(',').map(Number);
    const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lon}`;
    window.open(googleMapsUrl, '_blank');
  }

  dividirFechaHora(fechaHora: string) {
    const [fecha, hora] = fechaHora.split('T'); // Separa la fecha y la hora
    const [anio, mes, dia] = fecha.split('-'); // Separa la fecha en año, mes y día
  
    // Convertir el mes de número a nombre
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const mesNombre = meses[parseInt(mes, 10) - 1]; // Convertir el mes de número a texto
  
    // Formato: día mes (por ejemplo, 28 Noviembre)
    const fechaFormateada = `${dia} ${mesNombre}`;
  
    return { fechaFormateada, hora };
  }
  
}
