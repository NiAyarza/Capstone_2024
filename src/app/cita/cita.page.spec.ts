import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CitaPage } from './cita.page';

describe('CitaPage', () => {
  let component: CitaPage;
  let fixture: ComponentFixture<CitaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CitaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
