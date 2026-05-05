import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TareasService {

  private API = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getTareas() {
    return this.http.get(`${this.API}/tareas`);
  }

  crearTarea(data: any) {
    return this.http.post(`${this.API}/tareas`, data);
  }

  eliminarTarea(id: string) {
    return this.http.delete(`${this.API}/tareas/${id}`);
  }
}