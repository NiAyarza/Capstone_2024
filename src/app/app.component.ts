import { Component, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy {
  showMenu: boolean = true;
  private routerSubscription: Subscription;

  constructor(private router: Router, private authService: AuthService) {
    this.routerSubscription = this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd) // Filtrando solo NavigationEnd
      )
      .subscribe((event: any) => { // Usando 'any' temporalmente
        const currentRoute = this.router.url;
        // Solo mostrar el menú si no estás en la página de login o registro
        this.showMenu = !(currentRoute === '/login' || currentRoute === '/registro');
      });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  logout() {
    localStorage.removeItem('user');
    this.authService.isAuthenticatedSubject.next(false); // Usando la propiedad pública
    this.router.navigate(['/login']);
  }
}
