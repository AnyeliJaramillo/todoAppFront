import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProyectosComponent } from './proyectos';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ProyectosService } from './proyectos.service';

describe('HU4 - Proyectos', () => {
  let component: ProyectosComponent;
  let fixture: ComponentFixture<ProyectosComponent>;

  const proyectosServiceMock = {
    obtenerProyectos: () => ({
      subscribe: (observer: any) => observer.next([])
    }),
    obtenerIngenieros: () => ({
      subscribe: (observer: any) => observer.next([])
    }),
    crearProyecto: () => ({
      subscribe: (observer: any) => observer.next({})
    }),
    actualizarProyecto: () => ({
      subscribe: (observer: any) => observer.next({})
    }),
    eliminarProyecto: () => ({
      subscribe: (observer: any) => observer.next({})
    })
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ProyectosComponent,
        RouterTestingModule,
        HttpClientTestingModule
      ],
      providers: [
        { provide: ProyectosService, useValue: proyectosServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProyectosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });
});