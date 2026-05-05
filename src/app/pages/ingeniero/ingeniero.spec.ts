import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Ingeniero } from './ingeniero';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService } from '../../core/services/auth.service';

describe('HU5 - Panel Ingeniero', () => {
  let component: Ingeniero;
  let fixture: ComponentFixture<Ingeniero>;

  const authServiceMock = {
    getUsuario: () => ({
      id: '123',
      nombre: 'Jose',
      rol: 'ingeniero'
    })
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Ingeniero,
        HttpClientTestingModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Ingeniero);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar usuario correctamente', () => {
    expect(component.usuario.nombre).toBe('Jose');
  });
});