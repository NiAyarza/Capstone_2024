import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DisponibilidadHorarioPage } from './disponibilidad-horario.page';

describe('DisponibilidadHorarioPage', () => {
  let component: DisponibilidadHorarioPage;
  let fixture: ComponentFixture<DisponibilidadHorarioPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DisponibilidadHorarioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
