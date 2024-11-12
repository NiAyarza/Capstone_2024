import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DisponibilidadHorarioPage } from './disponibilidad-horario.page';

const routes: Routes = [
  {
    path: '',
    component: DisponibilidadHorarioPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DisponibilidadHorarioPageRoutingModule {}
