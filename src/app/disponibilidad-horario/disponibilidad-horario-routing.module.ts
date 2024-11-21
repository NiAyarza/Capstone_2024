import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DisponibilidadHorarioPage } from './disponibilidad-horario.page';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; 

const routes: Routes = [
  {
    path: '',
    component: DisponibilidadHorarioPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes), ReactiveFormsModule],
  exports: [RouterModule],
})
export class DisponibilidadHorarioPageRoutingModule {}
