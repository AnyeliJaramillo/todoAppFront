import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.prod';


@Component({
  selector: 'app-tareas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tareas.html',
  styleUrl: './tareas.css'
})
export class Tareas implements OnInit {
  private API = environment.apiUrl;

  tareas: any[] = [];
  proyectos: any[] = [];
  ingenieros: any[] = [];

  cargando = false;
  mostrarModal = false;
  modoEdicion = false;
  tareaEditandoId = '';

  mostrarModalVer = false;
  tareaSeleccionada: any = null;

  mostrarConfirmacion = false;
  tareaAEliminar: string | null = null;

  mensaje = '';
  mostrarMensaje = false;
  cerrandoMensaje = false;
  tipoMensaje: 'success' | 'error' = 'success';

  tareaForm = {
    titulo: '',
    descripcion: '',
    proyecto: '',
    ingenieroAsignado: '',
    prioridad: 'Media',
    estado: 'Pendiente'
  };

  constructor(
    private http: HttpClient,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarTareas();
    this.cargarProyectos();
    this.cargarIngenieros();
  }

  cargarTareas(): void {
    this.cargando = true;

    this.http.get<any>(`${this.API}/tareas`).subscribe({
      next: (respuesta) => {
        const lista = Array.isArray(respuesta)
          ? respuesta
          : Array.isArray(respuesta?.data)
          ? respuesta.data
          : [];

        this.tareas = [...lista];
        this.cargando = false;
        this.cdRef.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar tareas', error);
        this.cargando = false;
        this.mostrarNotificacion('No se pudieron cargar las tareas', 'error');
        this.cdRef.detectChanges();
      }
    });
  }

  cargarProyectos(): void {
    this.http.get<any>(`${this.API}/proyectos`).subscribe({
      next: (respuesta) => {
        const lista = Array.isArray(respuesta)
          ? respuesta
          : Array.isArray(respuesta?.data)
          ? respuesta.data
          : [];

        this.proyectos = lista;
        this.cdRef.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar proyectos', error);
      }
    });
  }

  cargarIngenieros(): void {
    this.http.get<any>(`${this.API}/usuarios`).subscribe({
      next: (respuesta) => {
        const lista = Array.isArray(respuesta)
          ? respuesta
          : Array.isArray(respuesta?.data)
          ? respuesta.data
          : [];

        this.ingenieros = lista.filter((u: any) => u.rol === 'ingeniero');
        this.cdRef.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar ingenieros', error);
      }
    });
  }

  abrirModal(): void {
    this.modoEdicion = false;
    this.tareaEditandoId = '';

    this.tareaForm = {
      titulo: '',
      descripcion: '',
      proyecto: '',
      ingenieroAsignado: '',
      prioridad: 'Media',
      estado: 'Pendiente'
    };

    this.mostrarModal = true;
  }

  abrirModalEditar(tarea: any): void {
    this.modoEdicion = true;
    this.tareaEditandoId = tarea._id;

    this.tareaForm = {
      titulo: tarea.titulo || '',
      descripcion: tarea.descripcion || '',
      proyecto: tarea.proyecto?._id || tarea.proyecto || '',
      ingenieroAsignado: tarea.ingenieroAsignado?._id || tarea.ingenieroAsignado || '',
      prioridad: tarea.prioridad || 'Media',
      estado: tarea.estado || 'Pendiente'
    };

    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.modoEdicion = false;
    this.tareaEditandoId = '';
  }

  guardarTarea(): void {
    if (
      !this.tareaForm.titulo.trim() ||
      !this.tareaForm.descripcion.trim() ||
      !this.tareaForm.proyecto ||
      !this.tareaForm.ingenieroAsignado
    ) {
      this.mostrarNotificacion('Completa todos los campos de la tarea', 'error');
      return;
    }

    if (this.modoEdicion && this.tareaEditandoId) {
      this.http.put<any>(`${this.API}/tareas/${this.tareaEditandoId}`, this.tareaForm).subscribe({
        next: (respuesta) => {
          const tareaActualizada = respuesta?.data ?? respuesta;

          this.tareas = this.tareas.map(t =>
            t._id === this.tareaEditandoId ? tareaActualizada : t
          );

          this.cerrarModal();
          this.mostrarNotificacion('Tarea actualizada correctamente', 'success');
          this.cdRef.detectChanges();
        },
        error: (error) => {
          console.error('Error al actualizar tarea', error);
          this.mostrarNotificacion(
            error?.error?.mensaje || 'No se pudo actualizar la tarea',
            'error'
          );
        }
      });
    } else {
      this.http.post<any>(`${this.API}/tareas`, this.tareaForm).subscribe({
        next: (respuesta) => {
          const nuevaTarea = respuesta?.data ?? respuesta;

          this.tareas = [nuevaTarea, ...this.tareas];

          this.cerrarModal();
          this.mostrarNotificacion('Tarea creada correctamente', 'success');
          this.cdRef.detectChanges();
        },
        error: (error) => {
          console.error('Error al crear tarea', error);
          this.mostrarNotificacion(
            error?.error?.mensaje || 'No se pudo crear la tarea',
            'error'
          );
        }
      });
    }
  }

  eliminarTarea(id?: string): void {
    if (!id) return;

    this.tareaAEliminar = id;
    this.mostrarConfirmacion = true;
  }

  confirmarEliminar(): void {
    if (!this.tareaAEliminar) return;

    this.http.delete(`${this.API}/tareas/${this.tareaAEliminar}`).subscribe({
      next: () => {
        this.tareas = this.tareas.filter(t => t._id !== this.tareaAEliminar);
        this.mostrarNotificacion('Tarea eliminada correctamente', 'success');
        this.cerrarConfirmacion();
        this.cdRef.detectChanges();
      },
      error: (error) => {
        console.error('Error al eliminar tarea', error);
        this.mostrarNotificacion('No se pudo eliminar la tarea', 'error');
        this.cerrarConfirmacion();
      }
    });
  }

  cerrarConfirmacion(): void {
    this.mostrarConfirmacion = false;
    this.tareaAEliminar = null;
  }

  abrirModalVer(tarea: any): void {
    this.tareaSeleccionada = tarea;
    this.mostrarModalVer = true;
  }

  cerrarModalVer(): void {
    this.mostrarModalVer = false;
    this.tareaSeleccionada = null;
  }

  clasePrioridad(prioridad: string): string {
    switch (prioridad) {
      case 'Alta':
        return 'prioridad-alta';
      case 'Media':
        return 'prioridad-media';
      case 'Baja':
        return 'prioridad-baja';
      default:
        return '';
    }
  }

  claseEstado(estado: string): string {
    switch (estado) {
      case 'Pendiente':
        return 'estado-pendiente';
      case 'En progreso':
        return 'estado-progreso';
      case 'Finalizada':
        return 'estado-finalizada';
      default:
        return '';
    }
  }

  mostrarNotificacion(texto: string, tipo: 'success' | 'error'): void {
  this.mensaje = texto;
  this.tipoMensaje = tipo;
  this.mostrarMensaje = true;
  this.cerrandoMensaje = false;

  setTimeout(() => {
    this.cerrandoMensaje = true;
    this.cdRef.detectChanges();
  }, 2200);

  setTimeout(() => {
    this.mostrarMensaje = false;
    this.cerrandoMensaje = false;
    this.cdRef.detectChanges();
  }, 2500);
}
}