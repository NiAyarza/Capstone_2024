import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NominatimService {
  private apiUrl = 'https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}';

  constructor(private http: HttpClient) {}

  obtenerDireccion(lat: number, lon: number) {
    const url = this.apiUrl.replace('{lat}', lat.toString()).replace('{lon}', lon.toString());
    return this.http.get(url);
  }
}
