import { Component, OnInit } from '@angular/core';
import { ProfesionalService } from '../services/profesional.service';
import { GeocodingService } from '../services/geocoding.service';
import { ModalController } from '@ionic/angular';
import * as L from 'leaflet'; // Asegúrate de tener la librería de Leaflet
import { forkJoin } from 'rxjs'; // Para manejar múltiples observables
import { MapModalComponent } from '../map-modal/map-modal.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  profesionales: any[] = [];
  distanciaKm: number = 20; // Distancia por defecto
  especialidadSeleccionada: string | undefined;
  miLatitud: number | null = null;
  miLongitud: number | null = null;
  cargando: boolean = false;
  errorUbicacion: string | null = null;
  map: any;

  constructor(
    private profesionalService: ProfesionalService,
    private geocodingService: GeocodingService,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.obtenerUbicacionActual(); // Carga inicial
    this.aplicarFiltros();
  }

  // Método para abrir el modal con el mapa (si es necesario)
  async abrirMapa() {
    // Aquí procesamos las direcciones y las convertimos en lat y lng
    const profesionalesConCoordenadas = this.profesionales.map((profesional: any) => {
      const [lat, lon] = this.parseDireccion(profesional.direccion);  // Asumiendo que la dirección está separada por coma (lat,lng)
      return {
        ...profesional,
        lat,
        lon
      };
    });
  
    // Ahora pasamos los profesionales con las coordenadas al modal
    const modal = await this.modalCtrl.create({
      component: MapModalComponent,
      componentProps: {
        fromPage: 'home',
        profesionales: profesionalesConCoordenadas,  // Pasamos solo las coordenadas
      }
    });
  
    modal.onDidDismiss().then((data) => {
      if (data.data) {
        console.log('Coordenadas seleccionadas:', data.data);
      }
    });
  
    return await modal.present();
  }

  aplicarFiltros() {
    if (!this.distanciaKm) {
      this.distanciaKm = 20; // Distancia por defecto
    }

    if (this.miLatitud === null || this.miLongitud === null) {
      console.error('No se puede aplicar filtros: las coordenadas del usuario no están disponibles.');
      return;
    }

    this.cargando = true;

    // Llamar al servicio para obtener profesionales cercanos
    this.profesionalService
      .obtenerProfesionalesCercanos(this.miLatitud, this.miLongitud, this.distanciaKm, this.especialidadSeleccionada)
      .then((profesionales) => {
        // Obtener un array de observables para las direcciones de cada profesional
        const observables = profesionales.map((profesional) => {
          const [lat, lon] = this.parseDireccion(profesional.direccion); // Convierte dirección en coordenadas
          
          // Llamar al servicio de geocodificación para obtener la dirección legible
          return this.geocodingService.obtenerDireccion(lat, lon);
        });

        // Esperar a que todas las solicitudes de geocodificación se resuelvan
        forkJoin(observables).subscribe((direccionesLegibles) => {
          // Asignar la dirección legible y calcular la distancia
          this.profesionales = profesionales.map((profesional, index) => {
            const [lat, lon] = this.parseDireccion(profesional.direccion);
            const distancia = this.calcularDistancia(this.miLatitud!, this.miLongitud!, lat, lon);
            const direccionLegible = direccionesLegibles[index]?.display_name || 'Dirección no disponible';

            // Procesar la dirección legible para mostrar solo los primeros tres elementos
            const direccionProcesada = this.procesarDireccion(direccionLegible);

            return {
              ...profesional,
              direccionLegible: direccionProcesada,
              distancia
            };
          });

          // Filtrar profesionales que están dentro del rango de distancia seleccionado
          this.profesionales = this.profesionales.filter((profesional) => profesional.distancia <= this.distanciaKm);
          
          this.mostrarProfesionalesEnMapa();
          this.cargando = false;
        }, (error) => {
          console.error('Error al obtener las direcciones:', error);
          this.cargando = false;
        });
      })
      .catch((error) => {
        console.error('Error al aplicar filtros:', error);
        this.cargando = false;
      });
  }

  // Mostrar profesionales en el mapa
  mostrarProfesionalesEnMapa() {
    if (this.map) {
      // Eliminar marcadores previos de profesionales
      this.map.eachLayer((layer: any) => {
        if (layer instanceof L.Marker && !layer.options.title) {
          this.map.removeLayer(layer);
        }
      });

      // Ícono del profesional (puedes cambiarlo por otro si lo deseas)
      const iconoProfesional = L.icon({
        iconUrl: 'https://leafletjs.com/examples/custom-icons/leaf-red.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      // Agregar marcadores de profesionales
      this.profesionales.forEach((profesional: any) => {
        const [lat, lon] = this.parseDireccion(profesional.direccion);

        if (!isNaN(lat) && !isNaN(lon)) {
          const marker = L.marker([lat, lon], { icon: iconoProfesional }).addTo(this.map);
          marker.bindPopup(
            `<b>${profesional.nombre}</b><br>${profesional.profesionales?.especialidad || 'Sin especialidad'}<br>${profesional.distancia} km`
          );
        }
      });
    }
  }

  // Método para convertir la dirección en coordenadas (lat, lon)
  parseDireccion(direccion: string): [number, number] {
    const [lat, lon] = direccion.split(',').map(Number);
    return [lat, lon];
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

  // Método para obtener la ubicación actual del usuario
  obtenerUbicacionActual() {
    if (navigator.geolocation) {
      const opciones = {
        enableHighAccuracy: true, // Solicitar la mejor precisión disponible
        timeout: 10000,           // 10 segundos de tiempo máximo para obtener la ubicación
        maximumAge: 0             // No usar una ubicación en caché
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.miLatitud = position.coords.latitude;
          this.miLongitud = position.coords.longitude;
          const accuracy = position.coords.accuracy; // Precisión en metros
          console.log(`Ubicación actual: Latitud ${this.miLatitud}, Longitud ${this.miLongitud}, Precisión: ${accuracy} metros`);
          this.aplicarFiltros(); // Llamar aplicarFiltros después de obtener la ubicación
          this.mostrarMapa(); // Mostrar el mapa después de obtener la ubicación
        },
        (error) => {
          console.error('Error al obtener la ubicación:', error);
        },
        opciones
      );
    } else {
      console.error('Geolocalización no soportada en este navegador');
    }
  }

  // Método para inicializar y mostrar el mapa de Leaflet
  mostrarMapa() {
    if (this.miLatitud !== null && this.miLongitud !== null) {
      // Inicializar el mapa en la ubicación del usuario
      this.map = L.map('map').setView([this.miLatitud, this.miLongitud], 13);

      // Agregar los tiles del mapa
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
      }).addTo(this.map);

      // Crear un marcador para la ubicación actual del usuario
      L.marker([this.miLatitud, this.miLongitud]).addTo(this.map)
        .bindPopup('Ubicación Actual')
        .openPopup();
    }
  }

  // Calcular la distancia entre dos puntos (lat1, lon1) y (lat2, lon2)
  calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la tierra en km
    const dLat = this.deg2rad(lat2 - lat1);  // Diferencia de latitudes en radianes
    const dLon = this.deg2rad(lon2 - lon1);  // Diferencia de longitudes en radianes
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distancia = R * c; // Distancia en km
    return distancia;
  }

  // Convertir grados a radianes
  deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
