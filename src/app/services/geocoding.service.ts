import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {
  constructor(private http: HttpClient) {}

  // Método para convertir una dirección en coordenadas usando Nominatim con restricción de país
  geocodeAddress(address: string): Observable<any> {
    const encodedAddress = encodeURIComponent(address); // Codifica la dirección
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`;

    return this.http.get(url);
  }

}
