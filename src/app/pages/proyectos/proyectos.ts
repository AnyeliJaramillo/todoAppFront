import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TareasService } from '../tareas/tareas.service';
import { ProyectosService } from './proyectos.service';
import Swal from 'sweetalert2';

type EstadoProyecto = 'Activo' | 'En espera' | 'Finalizado';
type PrioridadProyecto = 'Alta' | 'Media' | 'Baja';

@Component({
  selector: 'app-proyectos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './proyectos.html',
  styleUrl: './proyectos.css'
})
export class ProyectosComponent implements OnInit {

  proyectos: any[] = [];
  proyectosFiltrados: any[] = [];
  ingenieros: any[] = [];

  tareas: any[] = [];
  tareasProyectoSeleccionado: any[] = [];

  cargando = false;
  mostrarModal = false;
  modoEdicion = false;
  proyectoEditandoId = '';

  busqueda = '';

  mensaje = '';
  mostrarMensaje = false;
  tipoMensaje: 'success' | 'error' = 'success';

  mostrarConfirmacion = false;
  proyectoAEliminar: string | null = null;

  proyectoForm: {
    nombre: string;
    descripcion: string;
    estado: EstadoProyecto;
    prioridad: PrioridadProyecto;
    ingenieroAsignado: string;
    fechaEntrega: string;
  } = {
    nombre: '',
    descripcion: '',
    estado: 'Activo',
    prioridad: 'Media',
    ingenieroAsignado: '',
    fechaEntrega: ''
  };

  constructor(
  private proyectosService: ProyectosService,
  private tareasService: TareasService,
  private cdRef: ChangeDetectorRef,
  private router: Router
) {}

  ngOnInit(): void {
    this.cargarProyectos();
    this.cargarIngenieros();
    this.cargarTareas();
  }

  irAInicio(): void {
    this.router.navigate(['/admin']);
  }

  cargarProyectos(): void {
    this.cargando = true;

    this.proyectosService.obtenerProyectos().subscribe({
      next: (respuesta: any) => {
        const lista = Array.isArray(respuesta)
          ? respuesta
          : Array.isArray(respuesta?.data)
            ? respuesta.data
            : [];

        this.proyectos = lista;
        this.proyectosFiltrados = lista;
        this.cargando = false;
        this.cdRef.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar proyectos', error);
        this.cargando = false;
        this.mostrarNotificacion('No se pudieron cargar los proyectos', 'error');
        this.cdRef.detectChanges();
      }
    });
  }

  cargarIngenieros(): void {
    this.proyectosService.obtenerIngenieros().subscribe({
      next: (respuesta: any) => {
        const lista = Array.isArray(respuesta)
          ? respuesta
          : Array.isArray(respuesta?.data)
            ? respuesta.data
            : [];

        this.ingenieros = lista;
        this.cdRef.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar ingenieros', error);
      }
    });
  }

  filtrarProyectos(): void {
    const texto = this.busqueda.toLowerCase().trim();

    this.proyectosFiltrados = this.proyectos.filter((proyecto) =>
      proyecto.nombre?.toLowerCase().includes(texto) ||
      proyecto.descripcion?.toLowerCase().includes(texto) ||
      proyecto.estado?.toLowerCase().includes(texto) ||
      proyecto.prioridad?.toLowerCase().includes(texto)
    );
  }

  cargarTareas(): void {
  this.tareasService.getTareas().subscribe({
    next: (respuesta: any) => {
      const lista = Array.isArray(respuesta)
        ? respuesta
        : Array.isArray(respuesta?.data)
          ? respuesta.data
          : [];

      this.tareas = lista;
      this.cdRef.detectChanges();
    },
    error: (error) => {
      console.error('Error al cargar tareas', error);
    }
  });
}

  abrirModalNuevo(): void {
    this.modoEdicion = false;
    this.proyectoEditandoId = '';

    this.proyectoForm = {
      nombre: '',
      descripcion: '',
      estado: 'Activo',
      prioridad: 'Media',
      ingenieroAsignado: '',
      fechaEntrega: ''
    };

    this.mostrarModal = true;
  }

  mostrarModalVer = false;
proyectoSeleccionado: any = null;

abrirModalVer(proyecto: any): void {
  this.proyectoSeleccionado = proyecto;

  this.tareasProyectoSeleccionado = this.tareas.filter(
    (tarea: any) => {
      const proyectoId =
        typeof tarea.proyecto === 'object'
          ? tarea.proyecto._id
          : tarea.proyecto;

      return proyectoId === proyecto._id;
    }
  );

  this.mostrarModalVer = true;
}

cerrarModalVer(): void {
  this.mostrarModalVer = false;
  this.proyectoSeleccionado = null;
}

  abrirModalEditar(proyecto: any): void {
    this.modoEdicion = true;
    this.proyectoEditandoId = proyecto._id;

    this.proyectoForm = {
      nombre: proyecto.nombre || '',
      descripcion: proyecto.descripcion || '',
      estado: (proyecto.estado || 'Activo') as EstadoProyecto,
      prioridad: (proyecto.prioridad || 'Media') as PrioridadProyecto,
      ingenieroAsignado: proyecto.ingenieroAsignado?._id || proyecto.ingenieroAsignado || '',
      fechaEntrega: proyecto.fechaEntrega ? proyecto.fechaEntrega.substring(0, 10) : ''
    };

    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.modoEdicion = false;
    this.proyectoEditandoId = '';
  }

  guardarProyecto(): void {
    if (
      !this.proyectoForm.nombre.trim() ||
      !this.proyectoForm.descripcion.trim() ||
      !this.proyectoForm.fechaEntrega
    ) {
      this.mostrarNotificacion('Completa todos los campos obligatorios', 'error');
      return;
    }

    if (this.modoEdicion && this.proyectoEditandoId) {
      this.proyectosService.actualizarProyecto(this.proyectoEditandoId, this.proyectoForm).subscribe({
        next: (respuesta: any) => {
          const proyectoActualizado = respuesta?.data ?? respuesta;

          this.proyectos = this.proyectos.map((p) =>
            p._id === this.proyectoEditandoId ? proyectoActualizado : p
          );

          this.filtrarProyectos();
          this.cerrarModal();
          this.mostrarNotificacion('Proyecto actualizado correctamente', 'success');
          this.cdRef.detectChanges();
        },
        error: (error) => {
          console.error('Error al actualizar proyecto', error);
          this.mostrarNotificacion('No se pudo actualizar el proyecto', 'error');
        }
      });
    } else {
      this.proyectosService.crearProyecto(this.proyectoForm).subscribe({
        next: (respuesta: any) => {
          const nuevoProyecto = respuesta?.data ?? respuesta;

          this.proyectos = [nuevoProyecto, ...this.proyectos];
          this.filtrarProyectos();

          this.cerrarModal();
          this.mostrarNotificacion('Proyecto creado correctamente', 'success');
          this.cdRef.detectChanges();
        },
        error: (error) => {
          console.error('Error al crear proyecto', error);
          this.mostrarNotificacion('No se pudo crear el proyecto', 'error');
        }
      });
    }
  }

  async eliminarProyecto(id?: string): Promise<void> {
  if (!id) return;

  const resultado = await Swal.fire({
    title: '¿Eliminar proyecto?',
    text: 'Recuerda que se perderá toda la información de este mismo.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#64748b',
    backdrop: true,
    reverseButtons: true
  });

  if (!resultado.isConfirmed) return;

  this.proyectosService.eliminarProyecto(id).subscribe({
    next: () => {
      this.proyectos = this.proyectos.filter((p) => p._id !== id);
      this.proyectosFiltrados = this.proyectosFiltrados.filter((p) => p._id !== id);
      this.mostrarNotificacion('Proyecto eliminado correctamente', 'success');
      this.cdRef.detectChanges();
    },
    error: (error) => {
      console.error('Error al eliminar proyecto', error);
      this.mostrarNotificacion('No se pudo eliminar el proyecto', 'error');
      this.cdRef.detectChanges();
    }
  });
}
  obtenerNombreIngeniero(ingenieroId: any): string {
    if (!ingenieroId) return 'Sin asignar';

    if (typeof ingenieroId === 'object') {
      return ingenieroId.nombre || 'Sin asignar';
    }

    const ingeniero = this.ingenieros.find((i) => i._id === ingenieroId);
    return ingeniero ? ingeniero.nombre : 'Sin asignar';
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
      case 'Activo':
        return 'estado-activo';
      case 'En espera':
        return 'estado-espera';
      case 'Finalizado':
        return 'estado-finalizado';
      default:
        return '';
    }
  }

  mostrarNotificacion(texto: string, tipo: 'success' | 'error'): void {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    this.mostrarMensaje = true;

    setTimeout(() => {
      this.mostrarMensaje = false;
      this.cdRef.detectChanges();
    }, 2500);
  }
}