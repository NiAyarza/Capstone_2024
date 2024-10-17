import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import * as L from 'leaflet';
import { ModalController } from '@ionic/angular';
import { GeocodingService } from '../services/geocoding.service'; // Importa el servicio de geocodificación

// Configura los iconos de Leaflet sin eliminar la propiedad _getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/marker-icon-2x.png',
  iconUrl: 'assets/marker-icon.png',
  shadowUrl: 'assets/marker-shadow.png',
});

@Component({
  selector: 'app-map-modal',
  templateUrl: './map-modal.component.html',
  styleUrls: ['./map-modal.component.scss'],
})
export class MapModalComponent implements OnInit {
  map: any;
  marker: any;
  selectedCoords: { lat: number; lng: number } = { lat: -33.4489, lng: -70.6693 }; // Coordenadas por defecto

  constructor(private modalCtrl: ModalController, private geocodingService: GeocodingService) {}

  ngOnInit() {
    this.loadMap();
  }

  // Método para transformar la dirección en coordenadas y centrar el mapa
  geocodeAndCenterMap(address: string) {
    this.geocodingService.geocodeAddress(address).subscribe((data: any) => {
      if (data.length > 0) {
        const lat = data[0].lat;
        const lng = data[0].lon;
        this.selectedCoords = { lat: parseFloat(lat), lng: parseFloat(lng) };
        this.centerMapOnCoords(this.selectedCoords);
      } else {
        alert('No se encontraron resultados para la dirección proporcionada.');
      }
    });
  }

  loadMap() {
    this.map = L.map('map').setView([this.selectedCoords.lat, this.selectedCoords.lng], 13);

    // Capa de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    // Agregar un marcador arrastrable en la posición inicial
    this.marker = L.marker([this.selectedCoords.lat, this.selectedCoords.lng], {
      draggable: true,
    }).addTo(this.map);

    // Actualizar las coordenadas cuando el marcador se mueve
    this.marker.on('dragend', () => {
      this.selectedCoords = this.marker.getLatLng();
    });

    this.map.invalidateSize();
  }

  // Centrar el mapa en nuevas coordenadas y mover el marcador
  centerMapOnCoords(coords: { lat: number; lng: number }) {
    this.map.setView([coords.lat, coords.lng], 13);
    this.marker.setLatLng([coords.lat, coords.lng]);
  }

  confirmarDireccion() {
    // Enviar las coordenadas seleccionadas al cerrar el modal
    this.modalCtrl.dismiss(this.selectedCoords);
  }

  cerrarModal() {
    // Cerrar el modal sin enviar datos
    this.modalCtrl.dismiss();
  }
}
