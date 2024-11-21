import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { DisponibilidadService } from '../services/disponibilidad.service';
import { ModalController } from '@ionic/angular';
import { DisponibilidadFiltroModalComponent } from '../components/disponibilidad-filtro-modal/disponibilidad-filtro-modal.component';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { format, parseISO } from 'date-fns';


@Component({
  selector: 'app-disponibilidad-horario',
  templateUrl: './disponibilidad-horario.page.html',
  styleUrls: ['./disponibilidad-horario.page.scss'],
})
export class DisponibilidadHorarioPage implements OnInit {
  mostrarFormularioCrear: boolean = false;
  mostrarSelectorFiltroFecha: boolean = false;
  filtroFecha: string = '';
  horarios: any[] = [];
  horariosFiltrados: any[] = [];
  esProfesional: boolean = false;
  mostrarFormularioModificacion = false;
  disponibilidadSeleccionada: any = null;
  horaMinima: string = '';
  isCalendarOpen: boolean = false;
  currentFecha: string = new Date().toISOString().split('T')[0]; // Fecha actual
  calendarMode: 'crear' | 'modificar' = 'crear';

  // Formulario reactivo para manejar los datos de horario
  disponibilidadForm: FormGroup;

  constructor(
    private authService: AuthService,
    private disponibilidadService: DisponibilidadService,
    private modalCtrl: ModalController,
    private fb: FormBuilder
  ) {
    // Inicializamos el formulario en el constructor
    this.disponibilidadForm = this.fb.group({
      fecha: [new Date().toISOString().split('T')[0], Validators.required],
      horaInicio: [null, [Validators.required, this.validarHora]],
      horaFin: [null, [Validators.required, this.validarHora]],
    });
  }

  ngOnInit() {
    this.esProfesional = this.authService.getUserType() === 'profesional';
    this.cargarHorarios();
  }

  // Abrir el calendario en un modo específico
  openCalendar(mode: 'crear' | 'modificar') {
    this.calendarMode = mode;
    this.isCalendarOpen = true;
  }

  // Cerrar el calendario
  closeCalendar() {
    this.isCalendarOpen = false;
  }
  
  // Validación de hora
  validarHora(control: AbstractControl) {
    const horaCompleta = control.value;
  
    if (!horaCompleta) {
      return null; // No hay error
    }
  
    const regexHora = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
  
    // Si incluye 'T', extraer la hora en formato HH:mm
    const partes = horaCompleta.includes('T') 
      ? horaCompleta.split('T')[1]?.split(':') 
      : horaCompleta.split(':');
  
    if (!partes || partes.length < 2) {
      return { invalidHora: true }; // Formato inválido
    }
  
    const hora = `${partes[0]}:${partes[1]}`;
  
    // Validar contra el regex
    if (!regexHora.test(hora)) {
      return { invalidHora: true }; // Hora no válida
    }
  
    return null; // Hora válida
  }
  

  // Método para agregar horario
  async agregarHorario() {

    console.log('Estado del formulario:', this.disponibilidadForm.valid);
    console.log('Errores del formulario:', this.disponibilidadForm.errors);
    console.log('Valores del formulario:', this.disponibilidadForm.value);

    if (this.disponibilidadForm.invalid) {
      console.error('Formulario inválido');
      return;
    }
    if (this.disponibilidadForm.invalid) {
      console.error('Formulario inválido');
      return;
    }

    const { fecha, horaInicio, horaFin } = this.disponibilidadForm.value;

    

    if (!fecha || !horaInicio || !horaFin) {
      console.error('Algunos campos están vacíos o inválidos.');
      return;
    }

    console.log('Valores a enviar:', { fecha, horaInicio, horaFin });

    const usuario_id = this.authService.getUserId();
    if (!usuario_id) {
      console.error('ID de usuario no encontrado');
      return;
    }

    const profesional_id = await this.disponibilidadService.obtenerProfesionalId(usuario_id);
    if (!profesional_id) {
      console.error('No se pudo encontrar el profesional_id');
      return;
    }

    try {
      const horaInicioNormalizada = this.normalizarHora(horaInicio);
      const horaFinNormalizada = this.normalizarHora(horaFin);

      console.log('Fecha:', fecha);
      console.log('Hora Inicio:', horaInicioNormalizada);
      console.log('Hora Fin:', horaFinNormalizada);

      const { data, error } = await this.disponibilidadService.agregarDisponibilidad(
        profesional_id,
        fecha,
        horaInicioNormalizada,
        horaFinNormalizada
      );

      if (error) {
        console.error('Error al agregar disponibilidad:', error);
      } else {
        console.log('Disponibilidad agregada exitosamente:', data);
        this.cargarHorarios();
        this.disponibilidadForm.reset();
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Error al procesar los datos:', err.message);
      } else {
        console.error('Error desconocido:', err);
      }
    }
  }

  // Normalizar hora
  normalizarHora(horaCompleta: string): string {
    try {
      // Verificar si la hora está en formato 'HH:mm'
      if (!horaCompleta || horaCompleta.split(':').length !== 2) {
        throw new RangeError('Formato de hora no válido.');
      }
  
      // Obtener la hora y los minutos
      const [hora, minuto] = horaCompleta.split(':');
  
      // Crear un objeto Date con la hora local
      const fecha = new Date();
      fecha.setHours(Number(hora), Number(minuto), 0, 0);  // Setea la hora y minuto (segundos y milisegundos en 0)
  
      // Verificar si la fecha es válida
      if (isNaN(fecha.getTime())) {
        throw new RangeError('Fecha no válida.');
      }
  
      // Devolver la hora en formato 'HH:mm:ss' en la zona horaria local
      return format(fecha, 'HH:mm:ss');
    } catch (error) {
      console.error('Error al normalizar hora:', error);
      throw new RangeError('Formato de hora no válido.');
    }
  }

  // Normalizar fecha
  normalizarFecha(fechaCompleta: string): string {
    const fecha = parseISO(fechaCompleta);
    return format(fecha, 'yyyy-MM-dd');
  }
  
  // Métodos de utilidad para extraer fecha y hora
  private extraerFecha(fechaCompleta: string): string | null {
    return fechaCompleta ? fechaCompleta.split('T')[0] : null; // Retorna YYYY-MM-DD
  }

  private extraerHora(horaCompleta: string): string | null {
    const partes = horaCompleta.split('T')[1];
    return partes ? partes.split('Z')[0] : null; // Retorna HH:mm:ss
  }


  // Método para ordenar horarios
  ordenarHorarios() {
    this.horarios.sort((a, b) => {
      const fechaA = new Date(`${a.fecha}T${a.hora_inicio}`);
      const fechaB = new Date(`${b.fecha}T${b.hora_inicio}`);
      return fechaA.getTime() - fechaB.getTime();
    });
  }

  async cambiarEstado(horario: any) {
    try {
      // Cambiar el estado según el estado actual
      const nuevoEstado = horario.estado === 'suspendido' ? 'activo' : 'suspendido';
      
      // Realizar la llamada al servicio para actualizar el estado en la base de datos
      const response = await this.disponibilidadService.cambiarEstadoDisponibilidad(horario.disponibilidad_id, nuevoEstado);
  
      // Verificar que la respuesta es válida
      if (response && response.error) {
        console.error('Error al cambiar estado:', response.error);
      } else {
        // Actualizar el estado en el objeto horario
        horario.estado = nuevoEstado;
        console.log('Estado actualizado a:', nuevoEstado);
      }
    } catch (err) {
      console.error('Error al cambiar estado:', err);
    }
  }
  

  // Método para abrir el formulario de modificación y cargar los datos actuales
  abrirFormularioModificacion(horario: any) {
    this.disponibilidadSeleccionada = horario;
    this.disponibilidadForm.patchValue({
      fecha: horario.fecha,
      horaInicio: horario.hora_inicio,
      horaFin: horario.hora_fin,
    });

    this.horaMinima = horario.hora_inicio; // Usamos la hora de inicio como hora mínima para la hora de fin

    this.mostrarFormularioModificacion = true;
  }

  // Cerrar el formulario de modificación
  cerrarFormularioModificacion() {
    this.mostrarFormularioModificacion = false;
    this.disponibilidadSeleccionada = null;
  }

  // Guardar los cambios en el horario seleccionado
  async guardarModificacion() {
    if (!this.disponibilidadSeleccionada) {
      console.error('No hay disponibilidad seleccionada');
      return;
    }
  
    const { disponibilidad_id } = this.disponibilidadSeleccionada;
    const { horaInicio, horaFin, fecha } = this.disponibilidadForm.value;
  
    try {
      // Normalizar las horas y la fecha
      const horaInicioNormalizada = this.normalizarHora(horaInicio ?? '');
      const horaFinNormalizada = this.normalizarHora(horaFin ?? '');
  
      if (!fecha) {
        console.error('Fecha no válida:', fecha);
        throw new RangeError('Fecha no válida.');
      }
  
      console.log('Modificando disponibilidad con:', { fecha, horaInicioNormalizada, horaFinNormalizada });
  
      const { error } = await this.disponibilidadService.modificarDisponibilidad(
        disponibilidad_id,
        fecha,
        horaInicioNormalizada,
        horaFinNormalizada
      );
  
      if (!error) {
        console.log('Disponibilidad modificada exitosamente');
        this.cerrarFormularioModificacion();
        this.cargarHorarios();
      } else {
        console.error('Error al modificar el horario:', error);
      }
    } catch (err) {
      if (err instanceof RangeError) {
        console.error('Error de rango:', err.message);
      } else {
        console.error('Error desconocido:', err);
      }
    }
  }

  // Toggle para mostrar/ocultar formulario de creación
  toggleCrearCitaForm() {
    this.mostrarFormularioCrear = !this.mostrarFormularioCrear;
  }

  // Establecer la fecha seleccionada
  setSelectedFecha(event: any) {
    const selectedDate = event.detail.value.split('T')[0]; // Extraer la fecha en formato YYYY-MM-DD
    console.log('Fecha seleccionada:', selectedDate);
  
    if (selectedDate) {
      this.filtroFecha = selectedDate; // Asignar la fecha seleccionada al filtro
      this.filtrarHorarios();  // Filtrar los horarios por la fecha seleccionada
    } else {
      console.error('Fecha seleccionada no válida');
    }
    this.closeCalendar(); // Cerrar el calendario
  }

  // Método para cargar los horarios de la base de datos
  async cargarHorarios() {
    const usuario_id = this.authService.getUserId();
    if (!usuario_id) {
      console.error('ID de usuario no encontrado');
      return;
    }

    const profesional_id = await this.disponibilidadService.obtenerProfesionalId(usuario_id);
    if (!profesional_id) {
      console.error('No se pudo encontrar el profesional_id');
      return;
    }

    const { data, error } = await this.disponibilidadService.obtenerDisponibilidad(profesional_id);
    if (!error) {
      this.horarios = data ?? [];
      this.filtrarHorarios();  // Filtrar los horarios por la fecha actual al cargar
    } else {
      console.error('Error al cargar disponibilidad:', error);
    }
  }

  // Filtrar los horarios según la fecha seleccionada
  filtrarHorarios() {
    // Verifica que el filtro de fecha esté definido
    if (this.filtroFecha) {
      // Filtrar por la fecha seleccionada
      this.horariosFiltrados = this.horarios.filter(horario => {
        // Asegúrate de que las fechas están en el mismo formato (YYYY-MM-DD)
        const fechaHorarios = new Date(horario.fecha).toISOString().split('T')[0]; // Convertir la fecha a formato YYYY-MM-DD
        return fechaHorarios === this.filtroFecha;
      });
    } else {
      // Si no hay filtro, mostrar solo los horarios de la fecha actual
      this.horariosFiltrados = this.horarios.filter(horario => {
        const fechaHorarios = new Date(horario.fecha).toISOString().split('T')[0]; // Convertir la fecha a formato YYYY-MM-DD
        return fechaHorarios === this.currentFecha;
      });
    }
  }

  // Abrir el modal para seleccionar la fecha
  async abrirSelectorFiltroFecha() {
    const modal = await this.modalCtrl.create({
      component: DisponibilidadFiltroModalComponent,
      componentProps: {
        filtroFecha: this.filtroFecha,
      },
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data?.fecha) {
      this.filtroFecha = data.fecha;  // Establecer el filtro con la fecha seleccionada
      this.filtrarHorarios();  // Filtrar los horarios por la nueva fecha seleccionada
    }
  }

  // Mostrar solo los horarios de la fecha actual
  fechaActual() {
    this.filtroFecha = this.currentFecha;  // Establecer el filtro a la fecha actual
    this.filtrarHorarios();  // Filtrar los horarios por la fecha actual
  }

  // Mostrar todos los horarios (resetear el filtro y mostrar todos los horarios)
  mostrarTodasLasHoras() {
    this.filtroFecha = '';  // Resetear el filtro
    this.horariosFiltrados = this.horarios;  // Mostrar todos los horarios
  }
}


