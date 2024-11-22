import { Component } from '@angular/core';
import { ProfesionalService } from '../services/profesional.service';
import { GeocodingService } from '../services/geocoding.service'; // Importamos el servicio

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  profesionales: any[] = [];
  distanciaKm: number = 10; // Distancia por defecto
  especialidadSeleccionada: string | undefined;
  miLatitud: number = -33.4489; // Coordenadas del usuario
  miLongitud: number = -70.6693;
  cargando: boolean = false;


  constructor(private profesionalService: ProfesionalService, private geocodingService: GeocodingService) {}

  ngOnInit() {
    console.log('Coordenadas del usuario:', this.miLatitud, this.miLongitud);
    this.aplicarFiltros(); // Carga inicial
  }

  aplicarFiltros() {
    if (!this.distanciaKm) {
      this.distanciaKm = 10; // Valor por defecto si no se establece
    }
  
    this.profesionalService
      .obtenerProfesionalesCercanos(this.miLatitud, this.miLongitud, this.distanciaKm, this.especialidadSeleccionada)
      .then((profesionales) => {
        this.profesionales = profesionales;
  
        // Para cada profesional, obtener la dirección
        this.profesionales.forEach((profesional: any) => {
          const [lat, lon] = this.parseDireccion(profesional.direccion);
          this.geocodingService.obtenerDireccion(lat, lon).subscribe((direccion) => {
            if (direccion && direccion.display_name) {
              // Procesamos la dirección para obtener solo el número, la calle y la comuna
              profesional.direccionLegible = this.procesarDireccion(direccion.display_name);
            } else {
              profesional.direccionLegible = 'Dirección no disponible';
            }
          });
  
          // Calcular la distancia y agregarla al profesional
          const distancia = this.calcularDistancia(this.miLatitud, this.miLongitud, lat, lon);
          profesional.distancia = distancia; // Asignamos la distancia calculada al profesional
        });
      })
      .catch((error) => {
        console.error('Error al aplicar filtros:', error);
      });
  }
  

  // Método para convertir la dirección en coordenadas (lat, lon)
  parseDireccion(direccion: string): [number, number] {
    const [lat, lon] = direccion.split(',').map(Number);
    return [lat, lon];
  }

  // Método para procesar la dirección y obtener solo los primeros 3 elementos
  procesarDireccion(direccion: string): string {
    const partes = direccion.split(',');  // Separar por coma
    if (partes.length >= 3) {
      return `${partes[1]}, ${partes[0]}, ${partes[2]}`; // Tomar los primeros tres elementos
    } else {
      return direccion; // En caso de que no haya suficientes partes
    }
  }

  calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLon = this.degreesToRadians(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.degreesToRadians(lat1)) * Math.cos(this.degreesToRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distancia = R * c; // Distancia en km
    return distancia;
  }
  
  private degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Convertir grados a radianes
  degToRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
  
}
