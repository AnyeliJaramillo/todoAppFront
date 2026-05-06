import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Proyecto } from './proyecto.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProyectosService {
  private apiUrl = `${environment.apiUrl}/proyectos`;

  constructor(private http: HttpClient) {}

  obtenerProyectos(): Observable<Proyecto[]> {
    return this.http.get<Proyecto[]>(this.apiUrl);
  }

  obtenerProyectoPorId(id: string): Observable<Proyecto> {
    return this.http.get<Proyecto>(`${this.apiUrl}/${id}`);
  }

  crearProyecto(proyecto: Proyecto): Observable<Proyecto> {
    return this.http.post<Proyecto>(this.apiUrl, proyecto);
  }

  actualizarProyecto(id: string, proyecto: Proyecto): Observable<Proyecto> {
    return this.http.put<Proyecto>(`${this.apiUrl}/${id}`, proyecto);
  }

  eliminarProyecto(id: string): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.apiUrl}/${id}`);
  }
  obtenerIngenieros() {
  return this.http.get<any[]>(`${environment.apiUrl}/usuarios/ingenieros`);
}
}