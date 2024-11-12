import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ModalController } from '@ionic/angular';
import * as L from 'leaflet';
import { GeocodingService } from '../services/geocoding.service';

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
export class MapModalComponent implements OnInit, OnChanges {
  @Input() address!: string;
  map: any;
  marker: any;
  selectedCoords: { lat: number; lng: number } = { lat: -33.4489, lng: -70.6693 }; // Coordenadas por defecto (Santiago, Chile)

  constructor(private modalCtrl: ModalController, private geocodingService: GeocodingService) {}

  ngOnInit() {
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
    this.map = L.map('map').setView([coords.lat, coords.lng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    this.marker = L.marker([coords.lat, coords.lng], {
      draggable: true,
    }).addTo(this.map);

    this.marker.on('dragend', () => {
      this.selectedCoords = this.marker.getLatLng();
    });

    this.map.invalidateSize();
  }

  confirmarDireccion() {
    this.modalCtrl.dismiss(this.selectedCoords);
  }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }
}
