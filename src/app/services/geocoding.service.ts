import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {
  constructor(private http: HttpClient) {}

  // Método para convertir una dirección en coordenadas usando Nominatim
  geocodeAddress(address: string): Observable<any> {
    const encodedAddress = encodeURIComponent(address); // Codifica la dirección
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`;

    return this.http.get(url);
  }

  // Método para obtener la dirección usando latitud y longitud (geocodificación inversa)
  obtenerDireccion(lat: number, lon: number): Observable<any> {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;

    return this.http.get(url);
  }
}
