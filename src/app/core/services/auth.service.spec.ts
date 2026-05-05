import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('HU1 y HU2 - AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe iniciar sesión y guardar token y usuario', () => {
    const mockResponse = {
      token: 'abc123',
      usuario: {
        id: '1',
        nombre: 'Jose',
        rol: 'ingeniero'
      }
    };

    service.login('jose@test.com', '123456').subscribe((response) => {
      expect(response.token).toBe('abc123');
      expect(localStorage.getItem('token')).toBe('abc123');
      expect(JSON.parse(localStorage.getItem('usuario') || '{}').nombre).toBe('Jose');
    });

    const req = httpMock.expectOne('http://localhost:4000/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('debe cerrar sesión correctamente', () => {
  localStorage.setItem('token', 'abc123');
  localStorage.setItem('usuario', JSON.stringify({ nombre: 'Jose' }));

  service.logout();

  expect(service.isLoggedIn()).toBe(false);
  expect(localStorage.getItem('token')).toBeNull();
  expect(localStorage.getItem('usuario')).toBeNull();
});
});