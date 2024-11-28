import { NgModule, CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';

import { MapModalComponent } from './map-modal/map-modal.component';

import { DisponibilidadFiltroModalComponent } from './components/disponibilidad-filtro-modal/disponibilidad-filtro-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; 
import { EspecialidadPipe } from './especialidad.pipe';



@NgModule({
  declarations: [AppComponent, MapModalComponent,DisponibilidadFiltroModalComponent, EspecialidadPipe],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, HttpClientModule, FormsModule, ReactiveFormsModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
  exports: [DisponibilidadFiltroModalComponent,],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
