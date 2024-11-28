export interface OSRMRoute {
    routes: Array<{
      distance: number;  // Distancia en metros
      duration: number;  // Duración en segundos
    }>;
  }