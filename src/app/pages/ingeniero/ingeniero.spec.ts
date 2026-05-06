import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Ingeniero } from './ingeniero';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';

import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

describe('Sprint 3 - HU7, HU8 - Panel Ingeniero', () => {
  let component: Ingeniero;
  let fixture: ComponentFixture<Ingeniero>;
  let httpMock: HttpTestingController;

  let routerEvents = new Subject<any>();

  const authServiceMock = {
    getUsuario: () => ({
      id: '123',
      nombre: 'Jose',
      rol: 'ingeniero'
    })
  };

  const routerMock = {
    url: '/ingeniero',
    events: routerEvents.asObservable()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Ingeniero,
        HttpClientTestingModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Ingeniero);
    component = fixture.componentInstance;

    httpMock = TestBed.inject(HttpTestingController);

    fixture.detectChanges();

    const reqProyectos = httpMock.expectOne(
      `${environment.apiUrl}/proyectos/ingeniero/123`
    );

    reqProyectos.flush([]);

    const reqTareas = httpMock.expectOne(
      `${environment.apiUrl}/tareas/ingeniero/123`
    );

    reqTareas.flush([]);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar usuario correctamente', () => {
    expect(component.usuario.nombre).toBe('Jose');
    expect(component.ingenieroId).toBe('123');
  });

  /* =========================
      HU7 - VISUALIZAR TAREAS
  ========================== */

  it('HU7 - debe cargar tareas asignadas al ingeniero', () => {
    component.cargarTareas();

    const tareasMock = [
      {
        _id: 't1',
        titulo: 'Diseñar interfaz',
        descripcion: 'Crear diseño de pantalla',
        estado: 'Pendiente',
        prioridad: 'Alta',
        ingenieroAsignado: '123'
      }
    ];

    const req = httpMock.expectOne(
      `${environment.apiUrl}/tareas/ingeniero/123`
    );

    expect(req.request.method).toBe('GET');

    req.flush(tareasMock);

    expect(component.tareas.length).toBe(1);

    expect(component.tareas[0].titulo)
      .toBe('Diseñar interfaz');

    expect(component.cargandoTareas)
      .toBeFalsy();
  });

  it('HU7 - debe mostrar error si no se cargan las tareas', () => {
    component.cargarTareas();

    const req = httpMock.expectOne(
      `${environment.apiUrl}/tareas/ingeniero/123`
    );

    req.flush(
      'Error',
      {
        status: 500,
        statusText: 'Error servidor'
      }
    );

    expect(component.tareas)
      .toEqual([]);

    expect(component.errorMensaje)
      .toBe('No se pudieron cargar tus tareas asignadas');

    expect(component.cargandoTareas)
      .toBeFalsy();
  });

  /* =========================
      HU8 - CAMBIO ESTADO
  ========================== */

  it('HU8 - debe actualizar el estado de una tarea a En progreso', () => {

    const tarea = {
      _id: 't1',
      titulo: 'Crear modal',
      estado: 'Pendiente',
      proyecto: { _id: 'p1' },
      ingenieroAsignado: { _id: '123' }
    };

    component.tareas = [tarea];

    component.actualizarEstadoTarea(
      tarea,
      'En progreso'
    );

    const req = httpMock.expectOne(
      `${environment.apiUrl}/tareas/t1`
    );

    expect(req.request.method)
      .toBe('PUT');

    expect(req.request.body.estado)
      .toBe('En progreso');

    expect(req.request.body.proyecto)
      .toBe('p1');

    expect(req.request.body.ingenieroAsignado)
      .toBe('123');

    req.flush({
      ...tarea,
      estado: 'En progreso',
      proyecto: 'p1',
      ingenieroAsignado: '123'
    });

    expect(component.tareas[0].estado)
      .toBe('En progreso');

    expect(component.cargandoAccion)
      .toBeFalsy();
  });

  it('HU8 - debe actualizar el estado de una tarea a Finalizada', () => {

    const tarea = {
      _id: 't2',
      titulo: 'Probar sistema',
      estado: 'En progreso',
      proyecto: 'p2',
      ingenieroAsignado: '123'
    };

    component.tareas = [tarea];

    component.actualizarEstadoTarea(
      tarea,
      'Finalizada'
    );

    const req = httpMock.expectOne(
      `${environment.apiUrl}/tareas/t2`
    );

    expect(req.request.method)
      .toBe('PUT');

    expect(req.request.body.estado)
      .toBe('Finalizada');

    req.flush({
      ...tarea,
      estado: 'Finalizada'
    });

    expect(component.tareas[0].estado)
      .toBe('Finalizada');

    expect(component.cargandoAccion)
      .toBeFalsy();
  });

  it('HU8 - debe mostrar error si falla el cambio de estado de tarea', () => {

    const tarea = {
      _id: 't3',
      titulo: 'Actualizar vista',
      estado: 'Pendiente',
      proyecto: 'p3',
      ingenieroAsignado: '123'
    };

    component.tareas = [tarea];

    component.actualizarEstadoTarea(
      tarea,
      'En progreso'
    );

    const req = httpMock.expectOne(
      `${environment.apiUrl}/tareas/t3`
    );

    req.flush(
      'Error',
      {
        status: 500,
        statusText: 'Error servidor'
      }
    );

    expect(component.errorMensaje)
      .toBe('No se pudo actualizar el estado de la tarea');

    expect(component.cargandoAccion)
      .toBeFalsy();
  });

  /* =========================
      CAMBIO DE VISTA
  ========================== */

  it('HU7 - debe cambiar la vista a tareas', () => {

    component.definirVista('/ingeniero/tareas');

    expect(component.vistaActual)
      .toBe('tareas');
  });

  it('HU7 - debe cambiar la vista a proyectos', () => {

    component.definirVista('/ingeniero/proyectos');

    expect(component.vistaActual)
      .toBe('proyectos');
  });

  /* =========================
      CLASES ESTADO
  ========================== */

  it('HU8 - debe devolver la clase correcta según el estado de la tarea', () => {

    expect(component.claseEstadoTarea('Pendiente'))
      .toBe('badge-tarea-pendiente');

    expect(component.claseEstadoTarea('En progreso'))
      .toBe('badge-tarea-progreso');

    expect(component.claseEstadoTarea('Finalizada'))
      .toBe('badge-tarea-finalizada');
  });
});