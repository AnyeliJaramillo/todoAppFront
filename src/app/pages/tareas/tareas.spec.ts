import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Tareas } from './tareas';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';

describe('HU5 y HU6 - Tareas', () => {
  let component: Tareas;
  let fixture: ComponentFixture<Tareas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Tareas,
        HttpClientTestingModule,
        FormsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Tareas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe asignar clase prioridad alta', () => {
    const resultado = component.clasePrioridad('Alta');
    expect(resultado).toContain('alta');
  });
});