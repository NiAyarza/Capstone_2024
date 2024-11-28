import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProfesionalService } from '../services/profesional.service'; 
import { GeocodingService } from '../services/geocoding.service'; 
import { NavController } from '@ionic/angular';
import { DisponibilidadService } from '../services/disponibilidad.service'; 
import { CitaService } from '../services/cita.service';
import { AlertController } from '@ionic/angular';
import { format, parseISO } from 'date-fns';


@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {
  profesional: any;
  usuarioId: string = '';
  id: string | null = null;
  disponibilidad: any[] = [];
  disponibilidadCargada: boolean = false;
  fechaSeleccionada: string = new Date().toISOString();
  fechaHoy: string = new Date().toISOString().split('T')[0];
  mostrarCalendario: boolean = false;


  constructor(
    private activatedRoute: ActivatedRoute,
    private profesionalService: ProfesionalService,
    private navController: NavController,
    private geocodingService: GeocodingService,
    private disponibilidadService: DisponibilidadService,
    private citasService: CitaService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.usuarioId = this.activatedRoute.snapshot.paramMap.get('id')!;
    this.obtenerPerfil();
    this.cargarDisponibilidad(); // Cargar disponibilidad al inicio con fecha actual
  }
  

  async obtenerPerfil() {
    try {
      const profesionalData = await this.profesionalService.obtenerPerfil(this.usuarioId);

      if (profesionalData.direccion) {
        const [lat, lon] = this.parseDireccion(profesionalData.direccion);

        this.geocodingService.obtenerDireccion(lat, lon).subscribe((direccion) => {
          if (direccion && direccion.display_name) {
            profesionalData.direccionLegible = this.procesarDireccion(direccion.display_name);
          } else {
            profesionalData.direccionLegible = 'Dirección no disponible';
          }
          this.profesional = profesionalData;
        });
      } else {
        profesionalData.direccionLegible = 'Dirección no especificada';
        this.profesional = profesionalData;
      }
    } catch (error) {
      console.error('Error al obtener el perfil:', error);
      alert('No se pudo cargar el perfil. Verifica si el profesional existe.');
    }
  }

  // Función para cargar la disponibilidad filtrada por la fecha seleccionada
  async cargarDisponibilidad() {
    this.disponibilidadCargada = false; // Resetea el estado para que se muestre el mensaje de "Cargando"
    console.log("Fecha seleccionada:", this.fechaSeleccionada);
    // Obtener disponibilidad del profesional filtrada por fecha
    if (this.profesional && this.profesional.profesional_id) {
      await this.obtenerDisponibilidad(this.profesional.profesional_id, this.fechaSeleccionada);
    }
  }

  async obtenerDisponibilidad(profesional_id: number, fecha: string) { 
    if (!profesional_id) {
      console.error('Profesional ID no disponible');
      return;
    }
  
    try {
      // Obtener las disponibilidades del profesional
      const { data, error } = await this.disponibilidadService.obtenerDisponibilidad(profesional_id);
      if (error) {
        console.error('Error al obtener disponibilidad:', error);
        return;
      }
  
      // Obtener las citas del profesional
      const { data: citas, error: citasError } = await this.citasService.obtenerCitasPorProfesional(profesional_id);
      if (citasError) {
        console.error('Error al obtener citas:', citasError);
        return;
      }
  
      // Filtrar disponibilidad por la fecha seleccionada
      const disponibilidadFiltrada = data.filter(d => d.fecha === fecha);
      if (disponibilidadFiltrada && disponibilidadFiltrada.length > 0) {
        // Procesar la disponibilidad y las citas
        this.disponibilidad = this.procesarDisponibilidad(disponibilidadFiltrada, citas ?? []);
      } else {
        this.disponibilidad = []; // Si no hay disponibilidad, muestra un array vacío
      }
  
      this.disponibilidadCargada = true; // Marcar como cargada
    } catch (error) {
      console.error('Error al obtener disponibilidad:', error);
    }
  }
  
  procesarDisponibilidad(disponibilidad: any[], citas: any[]) {
    console.log('Disponibilidad cargada:', disponibilidad);
    return disponibilidad.map((d: any) => {
      // Array de nombres de meses en español
      const meses = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
      ];
  
      // Separar la fecha en partes (YYYY-MM-DD)
      const [year, month, day] = d.fecha.split('-'); // '2024-11-28' => ['2024', '11', '28']
  
      // Convertir el mes a número (1-12) y obtener el nombre del mes
      const mes = meses[parseInt(month, 10) - 1]; // '11' => 'noviembre'
  
      // Crear el formato 'día de mes' (ej. '28 de noviembre')
      const fechaFormateada = `${parseInt(day, 10)} ${mes}`;
  
      // Generar el formato de hora_inicio - hora_fin
      const horaInicio = new Date(`1970-01-01T${d.hora_inicio}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const horaFin = new Date(`1970-01-01T${d.hora_fin}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const horaInicioFin = `${horaInicio} - ${horaFin}`;
  
      // Verificar si ya existe una cita pendiente para esta disponibilidad
      const citaPendiente = citas.some((cita: any) => cita.disponibilidad_id === d.disponibilidad_id && cita.estado === 'pendiente');
  
      return {
        ...d,
        fechaFormateada,   // Agregar la fecha formateada al objeto
        horaInicioFin,     // Agregar el campo de horas formateadas
        citaPendiente,     // Agregar la información de la cita pendiente
      };
    });
  }
  
  
  
  
  
  // Función para manejar la selección de fecha desde el calendario
  onFechaSeleccionada(event: any) {
    this.fechaSeleccionada = event.detail.value.split('T')[0]; // Obtener la fecha seleccionada
    this.cargarDisponibilidad(); // Cargar la disponibilidad para la fecha seleccionada
    this.mostrarCalendario = false; // Ocultar el calendario después de seleccionar la fecha
  }

  // Función para mostrar u ocultar el calendario
  toggleCalendario() {
    this.mostrarCalendario = !this.mostrarCalendario;
  }

  normalizarHora(horaCompleta: string): string {
    try {
      // Verificar si la entrada es una fecha completa (con 'T' en el medio)
      if (horaCompleta.includes('T')) {
        // Si la hora está en formato '2024-11-22T13:52:00', extraemos solo la hora
        const fecha = new Date(horaCompleta);
        if (isNaN(fecha.getTime())) {
          throw new RangeError('Fecha no válida.');
        }
        // Retornar la hora en formato 'HH:mm:ss' (esto es la parte de la hora)
        return format(fecha, 'HH:mm:ss');
      } else {
        // Si la hora está en formato 'HH:mm', procesamos normalmente
        const [hora, minuto] = horaCompleta.split(':');
  
        // Crear un objeto Date con la hora local
        const fecha = new Date();
        fecha.setHours(Number(hora), Number(minuto), 0, 0); // Setea solo hora y minuto
  
        // Verificar si la fecha es válida
        if (isNaN(fecha.getTime())) {
          throw new RangeError('Fecha no válida.');
        }
  
        // Retornar la hora en formato 'HH:mm:ss' en la zona horaria local
        return format(fecha, 'HH:mm:ss'); // Esto formatea solo la hora
      }
    } catch (error) {
      console.error('Error al normalizar hora:', error);
      throw new RangeError('Formato de hora no válido.');
    }
  }
  
  // Método para formatear la fecha a "YYYY-MM-DD"
  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    const anio = date.getFullYear();
    const mes = (date.getMonth() + 1).toString().padStart(2, '0'); // Mes en formato 2 dígitos
    const dia = date.getDate().toString().padStart(2, '0'); // Día en formato 2 dígitos
    return `${anio}-${mes}-${dia}`;
  }
  
  // Convertir cadena "HH:mm" a objeto Date
  parseHora(hora: string): Date {
    const [horas, minutos] = hora.split(':').map(Number);
    const date = new Date();
    date.setHours(horas, minutos, 0, 0);
    return date;
  }
  
  // Formatear un objeto Date a "HH:mm"
  formatearHora(hora: Date): string {
    const horas = hora.getHours().toString().padStart(2, '0');
    const minutos = hora.getMinutes().toString().padStart(2, '0');
    return `${horas}:${minutos}`;
  }
  
  private generarHoras(horaInicio: string, horaFin: string): string[] {
    const horas: string[] = [];
    let inicio = this.convertirHoraATimestamp(horaInicio);
    const fin = this.convertirHoraATimestamp(horaFin);
  
    while (inicio < fin) {
      horas.push(this.convertirTimestampAHora(inicio));
      inicio += 60 * 60 * 1000; // Incrementa por una hora
    }
  
    return horas;
  }
  
  private convertirHoraATimestamp(hora: string): number {
    const [horas, minutos, segundos] = hora.split(':').map(Number);
    const ahora = new Date();
    ahora.setHours(horas, minutos, segundos || 0, 0); // Maneja segundos opcionales
    return ahora.getTime();
  }
  
  private convertirTimestampAHora(timestamp: number): string {
    const fecha = new Date(timestamp);
    const horas = fecha.getHours().toString().padStart(2, '0');
    const minutos = fecha.getMinutes().toString().padStart(2, '0');
    return `${horas}:${minutos}`;
  }

  // Normalizar fecha
  normalizarFecha(fechaCompleta: string): string {
    const fecha = parseISO(fechaCompleta);
    return format(fecha, 'yyyy-MM-dd');
  }

  async agendarCita(disponibilidad: any) {
    const usuarioId = localStorage.getItem('userId');
    
    if (!usuarioId) {
      const errorAlert = await this.alertController.create({
        header: 'Error',
        message: 'No se pudo identificar al usuario conectado. Por favor, inicie sesión nuevamente.',
        buttons: ['OK'],
      });
      await errorAlert.present();
      return;
    }
  
    // Construir la fecha completa (fecha + hora)
    const fechaCompleta = `${disponibilidad.fecha}T${disponibilidad.hora_inicio}`;
  
    const alert = await this.alertController.create({
      header: 'Confirmar Cita',
      message: `¿Estás seguro de que deseas agendar la cita para el ${fechaCompleta}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Confirmar',
          handler: async () => {
            const cita = {
              usuario_id: usuarioId,
              profesional_id: this.profesional.profesional_id,
              disponibilidad_id: disponibilidad.disponibilidad_id, // Asociar disponibilidad
              fecha_hora: fechaCompleta,
              estado: 'pendiente',
              fecha_creacion: new Date().toISOString(),
            };
  
            console.log('Datos de la cita a agendar:', cita);
  
            const { error } = await this.citasService.agendarCita(cita);
            if (error) {
              console.error('Error al agendar la cita:', error);
              const errorAlert = await this.alertController.create({
                header: 'Error',
                message: 'No se pudo agendar la cita.',
                buttons: ['OK'],
              });
              await errorAlert.present();
            } else {
              const successAlert = await this.alertController.create({
                header: 'Éxito',
                message: 'Cita agendada con éxito.',
                buttons: ['OK'],
              });
              await successAlert.present();
              this.cargarDisponibilidad(); // Recargar disponibilidad después de agendar
            }
          },
        },
      ],
    });
  
    await alert.present();
  }
  
  
  
  // Método para convertir la dirección en coordenadas (lat, lon)
  parseDireccion(direccion: string): [number, number] {
    const [lat, lon] = direccion.split(',').map(Number);
    return [lat, lon];
  }

  // Método para procesar la dirección y obtener solo los primeros 3 elementos
  procesarDireccion(direccion: string): string {
    const partes = direccion.split(',');
    if (partes.length >= 3) {
      return `${partes[1].trim()}, ${partes[0].trim()}, ${partes[2].trim()}`;
    } else {
      return direccion;
    }
  }

  volverAtras() {
    this.navController.back(); // Asegúrate de inyectar NavController en el constructor
  }
}
