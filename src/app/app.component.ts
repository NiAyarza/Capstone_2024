import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { MenuController } from '@ionic/angular'; // Importar el controlador de menú

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  showMenu: boolean = true;
  isProfessional: boolean = false;
  private routerSubscription: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService,
    private menuCtrl: MenuController // Inyectar el controlador de menú
  ) {
    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        const currentRoute = this.router.url;
        this.showMenu = !(currentRoute === '/login' || currentRoute === '/registro');
      });
  }

  ngOnInit() {
    this.updateUserType();
  }

   // Método para actualizar el tipo de usuario
   updateUserType() {
    const userType = this.getUserType();
    this.isProfessional = userType === 'profesional';
  }



  getUserType(): string | null {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user ? user.tipo_usuario : null;
  }

  logout() {
    localStorage.removeItem('user');
    this.authService.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  openMenu() {
    this.menuCtrl.open();
  }

  // Método para cerrar el menú
  closeMenu() {
    this.menuCtrl.close();
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}
