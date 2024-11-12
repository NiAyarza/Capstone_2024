import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { DisponibilidadService } from '../services/disponibilidad.service';

@Component({
  selector: 'app-disponibilidad-horario',
  templateUrl: './disponibilidad-horario.page.html',
  styleUrls: ['./disponibilidad-horario.page.scss'],
})
export class DisponibilidadHorarioPage implements OnInit {
  fecha: string = '';
  horaInicio: string = '';
  horaFin: string = '';
  filtroFecha: string = '';
  horarios: any[] = [];
  horariosFiltrados: any[] = [];
  esProfesional: boolean = false;
  mostrarFormularioModificacion = false; // Para mostrar el modal de modificación
  disponibilidadSeleccionada: any = null; // Almacena el horario a modificar

  constructor(
    private authService: AuthService,
    private disponibilidadService: DisponibilidadService
  ) {}

  ngOnInit() {
    // Verificar si el usuario es profesional
    this.esProfesional = this.authService.getUserType() === 'profesional';
    this.cargarHorarios();
  }

  async agregarHorario() {
    const profesional_id = this.authService.getUserId();
    if (!profesional_id) {
      console.error('ID de profesional no encontrado');
      return;
    }

    const { data, error } = await this.disponibilidadService.agregarDisponibilidad(
      profesional_id,
      this.fecha,
      this.horaInicio,
      this.horaFin
    );

    if (!error) {
      this.cargarHorarios();
    } else {
      console.error('Error al agregar disponibilidad:', error);
    }
  }

  async cargarHorarios() {
    const profesional_id = this.authService.getUserId();
    if (!profesional_id) {
      console.error('ID de profesional no encontrado');
      return;
    }
  
    const { data, error } = await this.disponibilidadService.obtenerDisponibilidad(profesional_id);
    if (!error) {
      this.horarios = data ?? [];
      this.ordenarHorarios();
      this.filtrarHorariosPorFecha();
    } else {
      console.error('Error al cargar disponibilidad:', error);
    }
  }

  ordenarHorarios() {
    this.horarios.sort((a, b) => {
      const fechaA = new Date(`${a.fecha}T${a.hora_inicio}`);
      const fechaB = new Date(`${b.fecha}T${b.hora_inicio}`);
      return fechaA.getTime() - fechaB.getTime();
    });
  }

  filtrarHorariosPorFecha() {
    if (this.filtroFecha) {
      this.horariosFiltrados = this.horarios.filter(
        horario => horario.fecha === this.filtroFecha
      );
    } else {
      this.horariosFiltrados = [...this.horarios];
    }
  }

  async suspenderHorario(disponibilidad_id: number) {
    const { error } = await this.disponibilidadService.suspenderDisponibilidad(disponibilidad_id);
    if (!error) {
      this.cargarHorarios();
    } else {
      console.error('Error al suspender el horario:', error);
    }
  }

  // Abrir el formulario de modificación y cargar los datos actuales
  abrirFormularioModificacion(horario: any) {
    this.disponibilidadSeleccionada = horario;
    this.fecha = horario.fecha;
    this.horaInicio = horario.hora_inicio;
    this.horaFin = horario.hora_fin;
    this.mostrarFormularioModificacion = true;
  }

  // Cerrar el formulario de modificación
  cerrarFormularioModificacion() {
    this.mostrarFormularioModificacion = false;
    this.disponibilidadSeleccionada = null;
  }

  // Guardar los cambios en el horario seleccionado
  async guardarModificacion() {
    if (!this.disponibilidadSeleccionada) return;

    const { disponibilidad_id } = this.disponibilidadSeleccionada;
    const { error } = await this.disponibilidadService.modificarDisponibilidad(
      disponibilidad_id,
      this.fecha,
      this.horaInicio,
      this.horaFin
    );
    if (!error) {
      this.cerrarFormularioModificacion();
      this.cargarHorarios();
    } else {
      console.error('Error al modificar el horario:', error);
    }
  }
}
