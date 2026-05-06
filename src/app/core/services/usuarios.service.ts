import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.prod';

export interface Usuario {
  _id?: string;
  nombre: string;
  correo: string;
  password?: string;
  rol: string;
  activo?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private apiUrl = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  obtenerUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  crearUsuario(usuario: Usuario): Observable<any> {
    return this.http.post(this.apiUrl, usuario);
  }

  actualizarUsuario(id: string, usuario: Partial<Usuario>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, usuario);
  }

  eliminarUsuario(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}