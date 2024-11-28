import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import * as L from 'leaflet';
import { GeocodingService } from '../services/geocoding.service';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/marker-icon-2x.png',
  iconUrl: 'assets/marker-icon.png',
  shadowUrl: 'assets/marker-shadow.png',
});

const iconoProfesional = L.icon({
  iconUrl: 'https://leafletjs.com/examples/custom-icons/leaf-red.png', // Ícono para los profesionales
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const iconoUsuario = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',  // Usando el ícono predeterminado de Leaflet
  iconSize: [25, 41], // Tamaño adecuado para el ícono
  iconAnchor: [12, 41], // Ancla del ícono en la base
  popupAnchor: [1, -34], // Posición del pop-up
});


@Component({
  selector: 'app-map-modal',
  templateUrl: './map-modal.component.html',
  styleUrls: ['./map-modal.component.scss'],
})
export class MapModalComponent implements OnInit, OnChanges {
  @Input() fromPage: string | undefined;
  @Input() address!: string; // Dirección que puede ser recibida para geocodificar
  @Input() profesionales: any[] = []; // Recibimos los profesionales para mostrarlos en el mapa
  map: any;
  marker: any;
  selectedCoords: { lat: number; lng: number } = { lat: -33.4489, lng: -70.6693 }; // Coordenadas por defecto (Santiago, Chile)

  constructor(private modalCtrl: ModalController, private geocodingService: GeocodingService, private navController: NavController) {}

  ngOnInit() {
    console.log('Profesionales recibidos:', this.profesionales);
    if (this.address) {
      this.geocodeAndCenterMap(this.address);
    } else {
      this.loadMap(this.selectedCoords); // Si no hay address, carga con coordenadas por defecto
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['address'] && this.address) {
      this.geocodeAndCenterMap(this.address);
    }

    // Si se actualizan los profesionales, los mostramos en el mapa
    if (changes['profesionales']) {
      this.showProfesionalesOnMap();
    }
  }

  geocodeAndCenterMap(address: string) {
    this.geocodingService.geocodeAddress(address).subscribe((data: any) => {
      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        this.selectedCoords = { lat, lng };
        this.loadMap(this.selectedCoords); // Ahora carga el mapa con las coordenadas obtenidas
      } else {
        alert('No se encontraron resultados para la dirección proporcionada.');
        this.loadMap(this.selectedCoords); // Si falla la geocodificación, carga el mapa con coordenadas por defecto
      }
    });
  }

  loadMap(coords: { lat: number; lng: number }) {
    // Inicializar el mapa
    this.map = L.map('map').setView([coords.lat, coords.lng], 13);
  
    // Cargar las capas del mapa
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
    }).addTo(this.map);
  
    // Colocar el marcador para el usuario con el ícono
    this.marker = L.marker([coords.lat, coords.lng], {
      icon: iconoUsuario, // Usar el ícono del usuario
    }).addTo(this.map);
    this.marker.bindPopup("Ubicación del usuario");
  
    // Agregar los marcadores de los profesionales
    this.showProfesionalesOnMap();
  }

  showProfesionalesOnMap() {
    // Verificamos que existan profesionales
    if (!this.profesionales || this.profesionales.length === 0) {
      console.warn('No hay profesionales disponibles para mostrar en el mapa');
      return;
    }
  
    this.profesionales.forEach((profesional: any) => {
      const direccion = profesional.direccion;
      
      if (!direccion) {
        console.warn(`Profesional ${profesional.nombre} no tiene dirección válida`);
        return;
      }
  
      const [lat, lon] = direccion.split(',').map((coord: string) => parseFloat(coord));
  
      // Verificar que las coordenadas sean válidas
      if (isNaN(lat) || isNaN(lon)) {
        console.warn(`Coordenadas inválidas para el profesional ${profesional.nombre}`);
        return;
      }
  
      // Crear el marcador para el profesional
      const marker = L.marker([lat, lon], { icon: iconoProfesional }).addTo(this.map);
  
      // Contenido del popup
      const popupContent = `
        <div>
          <b>${profesional.nombre}</b><br>
          <i>Especialidad: ${profesional.especialidad}</i><br>
          <i>Experiencia: ${profesional.experiencia} años</i><br>
          <i>Dirección: ${this.procesarDireccion(profesional.direccion)}</i><br>
          <button class="ver-perfil-btn">Ver Perfil</button>
        </div>
      `;
  
      // Vincular el contenido del popup al marcador
      marker.bindPopup(popupContent);
  
      // Configurar el tooltip
      marker.bindTooltip(profesional.nombre, {
        permanent: true,
        direction: 'top',
        offset: [0, -20],
        className: 'profesional-tooltip',
      }).openTooltip();
  
      // Abrir el popup al hacer clic
      marker.on('click', () => {
        marker.openPopup();  // Abrir el popup explícitamente
      });
  
      // Asociar el evento "popupopen"
      marker.on('popupopen', () => {
        const popup = marker.getPopup();
  
        // Verificamos si el popup existe antes de intentar acceder a su elemento
        if (popup) {
          const popupElement = popup.getElement();
  
          if (popupElement) {
            const btnVerPerfil = popupElement.querySelector('.ver-perfil-btn');
  
            if (btnVerPerfil) {
              btnVerPerfil.addEventListener('click', () => {
                if (profesional.profesional_id) {
                  this.verPerfil(profesional.profesional_id);  // Redirigir al perfil del profesional
                } else {
                  console.warn(`ID de profesional no encontrado para ${profesional.nombre}`);
                }
              });
            } else {
              console.warn('Botón de perfil no encontrado');
            }
          } else {
            console.warn('Elemento del popup no encontrado');
          }
        } else {
          console.warn('Popup no encontrado');
        }
      });
    });
  }
  
  
  procesarDireccion(direccion: string): string {
    const partes = direccion.split(','); // Separar por coma
    if (partes.length >= 3) {
      return `${partes[1]}, ${partes[0]}, ${partes[3]}`; // Tomar los primeros tres elementos
    } else {
      return direccion; // En caso de que no haya suficientes partes
    }
  }
  
  // Método para redirigir al perfil
  verPerfil(profesionalId: string) {
    // Esto redirige a la página del perfil con el ID del profesional
    this.navController.navigateForward(`/perfil/${profesionalId}`);
  }

  confirmarDireccion() {
    this.modalCtrl.dismiss(this.selectedCoords);
  }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }
}
