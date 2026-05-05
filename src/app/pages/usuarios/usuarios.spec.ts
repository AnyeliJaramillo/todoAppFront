import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UsuariosComponent } from './usuarios';
import { UsuariosService } from '../../core/services/usuarios.service';

describe('HU3 - UsuariosComponent', () => {
  let component: UsuariosComponent;
  let fixture: ComponentFixture<UsuariosComponent>;

  const usuariosServiceMock = {
    obtenerUsuarios: () => ({
      subscribe: (observer: any) => observer.next([])
    }),
    crearUsuario: () => ({
      subscribe: (observer: any) => observer.next({})
    }),
    actualizarUsuario: () => ({
      subscribe: (observer: any) => observer.next({})
    }),
    eliminarUsuario: () => ({
      subscribe: (observer: any) => observer.next({})
    })
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuariosComponent, HttpClientTestingModule],
      providers: [
        { provide: UsuariosService, useValue: usuariosServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UsuariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente de usuarios', () => {
    expect(component).toBeTruthy();
  });
});