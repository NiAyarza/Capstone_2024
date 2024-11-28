import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OSRMRoute } from '../models/osrm-route.model';  // Importar la interfaz


@Injectable({
  providedIn: 'root',
})
export class OsrmService  {
  private baseUrl = 'http://router.project-osrm.org/route/v1/driving';

  constructor(private http: HttpClient) {}

  calcularRuta(lat1: number, lon1: number, lat2: number, lon2: number): Observable<OSRMRoute> {
    const url = `${this.baseUrl}/${lon1},${lat1};${lon2},${lat2}?overview=false`;
    return this.http.get<OSRMRoute>(url);  // Usamos la interfaz en la respuesta
  }
}
