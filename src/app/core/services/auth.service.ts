import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:4000/api/auth';

  constructor(private http: HttpClient) {}

  login(correo: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { correo, password }).pipe(
      tap((response) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('usuario', JSON.stringify(response.usuario));
      })
    );
  }

  loginConGoogle(credential: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/google-login`, { credential }).pipe(
      tap((response) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('usuario', JSON.stringify(response.usuario));
      })
    );
  }

  enviarCodigoRecuperacion(correo: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/enviar-codigo-recuperacion`, {
      correo
    });
  }

  verificarCodigoRecuperacion(correo: string, codigo: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/verificar-codigo-recuperacion`, {
      correo,
      codigo
    });
  }

  restablecerPassword(correo: string, nuevaPassword: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/restablecer-password`, {
      correo,
      nuevaPassword
    });
  }

  actualizarCredenciales(id: string, correo: string, password: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/credenciales`, {
      correo,
      password
    });
  }

  getUsuario() {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}