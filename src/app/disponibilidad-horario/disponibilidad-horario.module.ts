import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DisponibilidadHorarioPageRoutingModule } from './disponibilidad-horario-routing.module';

import { DisponibilidadHorarioPage } from './disponibilidad-horario.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DisponibilidadHorarioPageRoutingModule
  ],
  declarations: [DisponibilidadHorarioPage]
})
export class DisponibilidadHorarioPageModule {}
