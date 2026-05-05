import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { Proyecto } from '../proyectos/proyecto.interface';
import { ProyectosService } from '../proyectos/proyectos.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class AdminComponent implements OnInit {
  usuario: any = null;

  proyectos: Proyecto[] = [];
  ingenieros: any[] = [];
  cargando = false;

  mostrarModal = false;
  mostrarModalPerfil = false;
  mostrarModalTarea = false;
  guardandoTarea = false;

  mensaje = '';
  mostrarMensaje = false;
  tipoMensaje: 'success' | 'error' = 'success';

  mostrarReporte = false;

abrirReporte() {
  this.mostrarReporte = true;
}

cerrarReporte() {
  this.mostrarReporte = false;
}

  proyectoForm: Proyecto = {
    nombre: '',
    descripcion: '',
    estado: 'Activo',
    prioridad: 'Media',
    fechaEntrega: ''
  };

  perfilForm = {
    nombre: '',
    correo: '',
    password: '',
    rol: 'ingeniero',
    activo: true
  };

  tareaForm = {
    titulo: '',
    descripcion: '',
    proyecto: '',
    ingenieroAsignado: '',
    prioridad: 'Media',
    estado: 'Pendiente'
  };
  mesSeleccionado: string = '';

reporte = {
  totalProyectos: 0,
  activos: 0,
  finalizados: 0,
  totalTareas: 0,
  totalUsuarios: 0
};

tareas: any[] = [];
usuarios: any[] = [];

  constructor(
    private router: Router,
    private proyectosService: ProyectosService,
    private cdRef: ChangeDetectorRef,
    private http: HttpClient
  ) {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      this.usuario = JSON.parse(usuarioGuardado);
    }
  }

  ngOnInit(): void {
    this.cargarProyectos();
    this.cargarIngenieros();
    this.cargarTareas();
this.cargarUsuarios();
  }

  cargarTareas() {
  this.http.get<any>('http://localhost:4000/api/tareas').subscribe({
    next: (res) => {
      this.tareas = res;
    }
  });
}

cargarUsuarios() {
  this.http.get<any>('http://localhost:4000/api/usuarios').subscribe({
    next: (res) => {
      this.usuarios = res;
    }
  });
}
  cargarProyectos(): void {
    this.cargando = true;

    this.proyectosService.obtenerProyectos().subscribe({
      next: (respuesta: Proyecto[]) => {
        this.proyectos = [...respuesta];
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
generarReporte() {

  if (!this.mesSeleccionado) return;

  const mes = new Date(this.mesSeleccionado).getMonth();
  const anio = new Date(this.mesSeleccionado).getFullYear();

  // PROYECTOS
  const proyectosMes = this.proyectos.filter(p => {
    const fecha = new Date(p.fechaEntrega);
    return fecha.getMonth() === mes && fecha.getFullYear() === anio;
  });

  this.reporte.totalProyectos = proyectosMes.length;

  this.reporte.activos = proyectosMes.filter(p => p.estado === 'Activo').length;

  this.reporte.finalizados = proyectosMes.filter(p => p.estado === 'Finalizado').length;

  // TAREAS
  const tareasMes = this.tareas.filter(t => {
    const fecha = new Date(t.createdAt || new Date());
    return fecha.getMonth() === mes && fecha.getFullYear() === anio;
  });

  this.reporte.totalTareas = tareasMes.length;

  // USUARIOS
  const usuariosMes = this.usuarios.filter(u => {
    const fecha = new Date(u.createdAt || new Date());
    return fecha.getMonth() === mes && fecha.getFullYear() === anio;
  });

  this.reporte.totalUsuarios = usuariosMes.length;
}
  cargarIngenieros(): void {
    this.http.get<any>('http://localhost:4000/api/usuarios').subscribe({
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

  get totalProyectos(): number {
    return this.proyectos.length;
  }

  get proyectosActivos(): number {
    return this.proyectos.filter(p => p.estado === 'Activo').length;
  }

  get proyectosRecientes(): Proyecto[] {
    return this.proyectos.slice(0, 4);
  }

  abrirModalNuevo(): void {
    this.proyectoForm = {
      nombre: '',
      descripcion: '',
      estado: 'Activo',
      prioridad: 'Media',
      fechaEntrega: ''
    };
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  guardarProyecto(): void {
    if (
      !this.proyectoForm.nombre.trim() ||
      !this.proyectoForm.descripcion.trim() ||
      !this.proyectoForm.fechaEntrega
    ) {
      this.mostrarNotificacion('Completa todos los campos', 'error');
      return;
    }

    this.proyectosService.crearProyecto(this.proyectoForm).subscribe({
      next: () => {
        this.cerrarModal();
        this.cargarProyectos();
        this.mostrarNotificacion('Proyecto creado correctamente', 'success');
      },
      error: (error) => {
        console.error('Error al crear proyecto', error);
        this.mostrarNotificacion('No se pudo crear el proyecto', 'error');
      }
    });
  }

  abrirModalPerfil(): void {
    this.perfilForm = {
      nombre: '',
      correo: '',
      password: '',
      rol: 'ingeniero',
      activo: true
    };
    this.mostrarModalPerfil = true;
  }

  cerrarModalPerfil(): void {
    this.mostrarModalPerfil = false;
  }

  guardarPerfilIngeniero(): void {
    if (
      !this.perfilForm.nombre.trim() ||
      !this.perfilForm.correo.trim() ||
      !this.perfilForm.password.trim()
    ) {
      this.mostrarNotificacion('Completa todos los campos del perfil', 'error');
      return;
    }

    this.http.post('http://localhost:4000/api/usuarios', this.perfilForm).subscribe({
      next: () => {
        this.cerrarModalPerfil();
        this.cargarIngenieros();
        this.mostrarNotificacion('Perfil de ingeniero creado correctamente', 'success');
      },
      error: (error) => {
        console.error('Error al crear perfil', error);
        this.mostrarNotificacion(
          error?.error?.mensaje || 'No se pudo crear el perfil',
          'error'
        );
      }
    });
  }

  abrirModalTarea(): void {
    this.tareaForm = {
      titulo: '',
      descripcion: '',
      proyecto: '',
      ingenieroAsignado: '',
      prioridad: 'Media',
      estado: 'Pendiente'
    };
    this.mostrarModalTarea = true;
  }

  cerrarModalTarea(): void {
    this.mostrarModalTarea = false;
  }

 guardarTarea(): void {
  if (this.guardandoTarea) return;

  if (
    !this.tareaForm.titulo.trim() ||
    !this.tareaForm.descripcion.trim() ||
    !this.tareaForm.proyecto ||
    !this.tareaForm.ingenieroAsignado
  ) {
    this.mostrarNotificacion('Completa todos los campos de la tarea', 'error');
    return;
  }

  this.guardandoTarea = true;

  this.http.post('http://localhost:4000/api/tareas', this.tareaForm).subscribe({
    next: () => {
      this.guardandoTarea = false;
      this.cerrarModalTarea();

      this.tareaForm = {
        titulo: '',
        descripcion: '',
        proyecto: '',
        ingenieroAsignado: '',
        prioridad: 'Media',
        estado: 'Pendiente'
      };

      this.mostrarNotificacion('Tarea creada correctamente', 'success');
      this.cdRef.detectChanges();
    },
    error: (error) => {
      this.guardandoTarea = false;
      console.error('Error al crear tarea', error);
      this.mostrarNotificacion(
        error?.error?.mensaje || 'No se pudo crear la tarea',
        'error'
      );
      this.cdRef.detectChanges();
    }
  });
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

  logout(): void {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    this.router.navigate(['/']);
  }

  irAProyectos(): void {
    this.router.navigate(['/proyectos']);
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
}