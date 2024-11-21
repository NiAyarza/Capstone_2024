import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DisponibilidadFiltroModalComponent } from './disponibilidad-filtro-modal.component';

describe('DisponibilidadFiltroModalComponent', () => {
  let component: DisponibilidadFiltroModalComponent;
  let fixture: ComponentFixture<DisponibilidadFiltroModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DisponibilidadFiltroModalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DisponibilidadFiltroModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
