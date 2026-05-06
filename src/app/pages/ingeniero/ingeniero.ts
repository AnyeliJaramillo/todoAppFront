import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-ingeniero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ingeniero.html',
  styleUrl: './ingeniero.css'
})
export class Ingeniero implements OnInit {
  usuario: any = null;
  ingenieroId = '';

  tareas: any[] = [];
  proyectos: any[] = [];

  cargandoTareas = false;
  cargandoProyectos = false;
  cargandoAccion = false;

  errorMensaje = '';

  vistaActual: 'inicio' | 'proyectos' | 'tareas' = 'inicio';

  private apiUrl = environment.apiUrl;
  
  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private cdRef: ChangeDetectorRef,
    private router: Router,
    
  ) {}

  ngOnInit(): void {
    this.usuario = this.authService.getUsuario();
    this.ingenieroId = this.usuario?.id || this.usuario?._id || '';

    if (!this.ingenieroId) {
      this.errorMensaje = 'No se encontró el ID del usuario autenticado';
      this.cdRef.detectChanges();
      return;
    }

    this.definirVista(this.router.url);
    this.cargarProyectos();
    this.cargarTareas();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.definirVista(event.urlAfterRedirects || event.url);
      });
  }

  definirVista(url: string): void {
    if (url.includes('/ingeniero/proyectos')) {
      this.vistaActual = 'proyectos';
    } else if (url.includes('/ingeniero/tareas')) {
      this.vistaActual = 'tareas';
    } else {
      this.vistaActual = 'inicio';
    }

    this.cdRef.detectChanges();
  }

  cargarProyectos(): void {
    this.cargandoProyectos = true;
    this.cdRef.detectChanges();

    const url = `${this.apiUrl}/proyectos/ingeniero/${this.ingenieroId}`;

    this.http.get<any[]>(url).subscribe({
      next: (respuesta) => {
        this.proyectos = Array.isArray(respuesta) ? respuesta : [];
        this.cargandoProyectos = false;
        this.cdRef.detectChanges();
      },
      error: (error) => {
        console.error('ERROR AL CARGAR PROYECTOS:', error);
        this.proyectos = [];
        this.errorMensaje = 'No se pudieron cargar tus proyectos asignados';
        this.cargandoProyectos = false;
        this.cdRef.detectChanges();
      }
    });
  }

  cargarTareas(): void {
    this.cargandoTareas = true;
    this.cdRef.detectChanges();

    const url = `${this.apiUrl}/tareas/ingeniero/${this.ingenieroId}`;

    this.http.get<any[]>(url).subscribe({
      next: (respuesta) => {
        this.tareas = Array.isArray(respuesta) ? respuesta : [];
        this.cargandoTareas = false;
        this.cdRef.detectChanges();
      },
      error: (error) => {
        console.error('ERROR AL CARGAR TAREAS:', error);
        this.tareas = [];
        this.errorMensaje = 'No se pudieron cargar tus tareas asignadas';
        this.cargandoTareas = false;
        this.cdRef.detectChanges();
      }
    });
  }

  actualizarEstadoProyecto(proyecto: any, nuevoEstado: 'Activo' | 'Finalizado'): void {
    this.cargandoAccion = true;

    const payload = {
      ...proyecto,
      estado: nuevoEstado,
      ingenieroAsignado: proyecto.ingenieroAsignado?._id || proyecto.ingenieroAsignado || null
    };

    this.http.put<any>(`${this.apiUrl}/proyectos/${proyecto._id}`, payload).subscribe({
      next: (respuesta) => {
        const proyectoActualizado = respuesta?.data ?? respuesta;

        this.proyectos = this.proyectos.map((p) =>
          p._id === proyecto._id ? proyectoActualizado : p
        );

        this.cargandoAccion = false;
        this.cdRef.detectChanges();
      },
      error: (error) => {
        console.error('Error al actualizar estado del proyecto', error);
        this.errorMensaje = 'No se pudo actualizar el estado del proyecto';
        this.cargandoAccion = false;
        this.cdRef.detectChanges();
      }
    });
  }

  actualizarEstadoTarea(tarea: any, nuevoEstado: 'En progreso' | 'Finalizada'): void {
    this.cargandoAccion = true;

    const payload = {
      ...tarea,
      estado: nuevoEstado,
      proyecto: tarea.proyecto?._id || tarea.proyecto,
      ingenieroAsignado: tarea.ingenieroAsignado?._id || tarea.ingenieroAsignado
    };

    this.http.put<any>(`${this.apiUrl}/tareas/${tarea._id}`, payload).subscribe({
      next: (respuesta) => {
        const tareaActualizada = respuesta?.data ?? respuesta;

        this.tareas = this.tareas.map((t) =>
          t._id === tarea._id ? tareaActualizada : t
        );

        this.cargandoAccion = false;
        this.cdRef.detectChanges();
      },
      error: (error) => {
        console.error('Error al actualizar estado de la tarea', error);
        this.errorMensaje = 'No se pudo actualizar el estado de la tarea';
        this.cargandoAccion = false;
        this.cdRef.detectChanges();
      }
    });
  }

  claseEstadoProyecto(estado: string): string {
    switch (estado) {
      case 'Activo':
        return 'badge-proyecto-activo';
      case 'En espera':
        return 'badge-proyecto-espera';
      case 'Finalizado':
        return 'badge-proyecto-finalizado';
      default:
        return '';
    }
  }

  claseEstadoTarea(estado: string): string {
    switch (estado) {
      case 'Pendiente':
        return 'badge-tarea-pendiente';
      case 'En progreso':
        return 'badge-tarea-progreso';
      case 'Finalizada':
        return 'badge-tarea-finalizada';
      default:
        return '';
    }
  }
}