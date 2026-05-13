import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { Proyecto } from '../proyectos/proyecto.interface';
import { ProyectosService } from '../proyectos/proyectos.service';
import { environment } from '../../../environments/environment';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

reporteDetallado: any = {
  resumen: {},
  proyectos: [],
  tareas: [],
  usuarios: []
};

tareas: any[] = [];
usuarios: any[] = [];

  private apiUrl = environment.apiUrl;

  constructor(
    private router: Router,
    private proyectosService: ProyectosService,
    private cdRef: ChangeDetectorRef,
    private http: HttpClient,
    
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
  this.http.get<any>(`${this.apiUrl}/tareas`).subscribe({
    next: (res) => {
      this.tareas = res;
    }
  });
}

cargarUsuarios() {
  this.http.get<any>(`${this.apiUrl}/usuarios`).subscribe({
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

      generarReporte(): void {
    if (!this.mesSeleccionado) {
      this.mostrarNotificacion('Selecciona un mes para generar el reporte', 'error');
      return;
    }

    const [anioSeleccionado, mesSeleccionado] = this.mesSeleccionado.split('-').map(Number);

    const perteneceAlMes = (fechaValor: any): boolean => {
      if (!fechaValor) return false;

      const fecha = new Date(fechaValor);
      return (
        fecha.getMonth() + 1 === mesSeleccionado &&
        fecha.getFullYear() === anioSeleccionado
      );
    };

    const obtenerId = (valor: any): string => {
      if (!valor) return '';
      if (typeof valor === 'string') return valor;
      return valor._id || valor.id || '';
    };

    const obtenerUsuario = (idUsuario: any): any => {
      const id = obtenerId(idUsuario);
      return this.usuarios.find((u: any) => obtenerId(u) === id);
    };

    const obtenerProyecto = (idProyecto: any): any => {
      const id = obtenerId(idProyecto);
      return this.proyectos.find((p: any) => obtenerId(p) === id);
    };

    const proyectosCreadosMes = this.proyectos.filter((p: any) =>
      perteneceAlMes(p.createdAt)
    );

    const proyectosEntregaMes = this.proyectos.filter((p: any) =>
      perteneceAlMes(p.fechaEntrega)
    );

    const tareasCreadasMes = this.tareas.filter((t: any) =>
      perteneceAlMes(t.createdAt)
    );

    const usuariosCreadosMes = this.usuarios.filter((u: any) =>
      perteneceAlMes(u.createdAt)
    );

    const proyectosDetallados = proyectosCreadosMes.map((proyecto: any) => {
      const tareasProyecto = this.tareas.filter((t: any) =>
        obtenerId(t.proyecto) === obtenerId(proyecto)
      );

      const ingenieroProyecto =
        obtenerUsuario(proyecto.ingenieroAsignado) ||
        obtenerUsuario(tareasProyecto[0]?.ingenieroAsignado);

      return {
        nombre: proyecto.nombre || 'Sin nombre',
        descripcion: proyecto.descripcion || 'Sin descripción',
        estado: proyecto.estado || 'Sin estado',
        prioridad: proyecto.prioridad || 'Sin prioridad',
        fechaCreacion: proyecto.createdAt || 'Sin fecha',
        fechaEntrega: proyecto.fechaEntrega || 'Sin fecha',
        ingeniero: ingenieroProyecto?.nombre || 'Sin asignar',
        totalTareas: tareasProyecto.length,
        tareas: tareasProyecto.map((t: any) => {
          const ingenieroTarea = obtenerUsuario(t.ingenieroAsignado);

          return {
            titulo: t.titulo || 'Sin título',
            descripcion: t.descripcion || 'Sin descripción',
            estado: t.estado || 'Sin estado',
            prioridad: t.prioridad || 'Sin prioridad',
            ingeniero: ingenieroTarea?.nombre || 'Sin asignar',
            fechaCreacion: t.createdAt || 'Sin fecha'
          };
        })
      };
    });

    const tareasDetalladas = tareasCreadasMes.map((t: any) => {
      const proyecto = obtenerProyecto(t.proyecto);
      const ingeniero = obtenerUsuario(t.ingenieroAsignado);

      return {
        titulo: t.titulo || 'Sin título',
        descripcion: t.descripcion || 'Sin descripción',
        proyecto: proyecto?.nombre || 'Sin proyecto',
        ingeniero: ingeniero?.nombre || 'Sin asignar',
        estado: t.estado || 'Sin estado',
        prioridad: t.prioridad || 'Sin prioridad',
        fechaCreacion: t.createdAt || 'Sin fecha'
      };
    });

    const usuariosDetallados = usuariosCreadosMes.map((u: any) => ({
      nombre: u.nombre || 'Sin nombre',
      correo: u.correo || 'Sin correo',
      rol: u.rol || 'Sin rol',
      estado: u.activo === false ? 'Inactivo' : 'Activo',
      fechaCreacion: u.createdAt || 'Sin fecha'
    }));

    this.reporte = {
      totalProyectos: proyectosCreadosMes.length,
      activos: proyectosCreadosMes.filter((p: any) => p.estado === 'Activo').length,
      finalizados: proyectosCreadosMes.filter((p: any) => p.estado === 'Finalizado').length,
      totalTareas: tareasCreadasMes.length,
      totalUsuarios: usuariosCreadosMes.length
    };

    this.reporteDetallado = {
      resumen: {
        mes: this.mesSeleccionado,
        fechaGeneracion: new Date().toLocaleDateString(),
        proyectosCreados: proyectosCreadosMes.length,
        proyectosEntregaMes: proyectosEntregaMes.length,
        proyectosActivos: proyectosCreadosMes.filter((p: any) => p.estado === 'Activo').length,
        proyectosEnEspera: proyectosCreadosMes.filter((p: any) => p.estado === 'En espera').length,
        proyectosFinalizados: proyectosCreadosMes.filter((p: any) => p.estado === 'Finalizado').length,
        tareasCreadas: tareasCreadasMes.length,
        usuariosCreados: usuariosCreadosMes.length
      },
      proyectosCreados: proyectosDetallados,
      proyectosEntregaMes: proyectosEntregaMes.map((p: any) => ({
        nombre: p.nombre || 'Sin nombre',
        estado: p.estado || 'Sin estado',
        prioridad: p.prioridad || 'Sin prioridad',
        fechaEntrega: p.fechaEntrega || 'Sin fecha'
      })),
      tareasCreadas: tareasDetalladas,
      usuariosCreados: usuariosDetallados
    };

    this.mostrarNotificacion('Reporte generado correctamente', 'success');
  }

  exportarExcel(): void {
    if (!this.mesSeleccionado) {
      this.mostrarNotificacion('Primero selecciona un mes', 'error');
      return;
    }

    this.generarReporte();

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet([this.reporteDetallado.resumen]),
      'Resumen'
    );

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(this.reporteDetallado.proyectosCreados),
      'Proyectos creados'
    );

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(this.reporteDetallado.proyectosEntregaMes),
      'Entregas del mes'
    );

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(this.reporteDetallado.tareasCreadas),
      'Tareas creadas'
    );

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(this.reporteDetallado.usuariosCreados),
      'Usuarios creados'
    );

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

    const archivo = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    saveAs(archivo, `reporte-mensual-actividad-${this.mesSeleccionado}.xlsx`);
  }

exportarPDF(): void {
  if (!this.mesSeleccionado) {
    this.mostrarNotificacion('Primero selecciona un mes', 'error');
    return;
  }

  this.generarReporte();

  const doc = new jsPDF('landscape');

  doc.setFontSize(18);
  doc.text('Reporte mensual de actividad - TodoAppDev', 14, 18);

  doc.setFontSize(11);
  doc.text(`Mes: ${this.reporteDetallado.resumen.mes}`, 14, 28);
  doc.text(`Fecha de generación: ${this.reporteDetallado.resumen.fechaGeneracion}`, 14, 35);

  autoTable(doc, {
    startY: 45,
    head: [[
      'Proyectos creados',
      'Entregas del mes',
      'Activos',
      'En espera',
      'Finalizados',
      'Tareas creadas',
      'Usuarios creados'
    ]],
    body: [[
      this.reporteDetallado.resumen.proyectosCreados,
      this.reporteDetallado.resumen.proyectosEntregaMes,
      this.reporteDetallado.resumen.proyectosActivos,
      this.reporteDetallado.resumen.proyectosEnEspera,
      this.reporteDetallado.resumen.proyectosFinalizados,
      this.reporteDetallado.resumen.tareasCreadas,
      this.reporteDetallado.resumen.usuariosCreados
    ]]
  });

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 12,
    head: [[
      'Proyecto',
      'Descripción',
      'Estado',
      'Prioridad',
      'Fecha creación',
      'Fecha entrega',
      'Ingeniero',
      'Total tareas'
    ]],
    body: this.reporteDetallado.proyectosCreados.map((p: any) => [
      p.nombre,
      p.descripcion,
      p.estado,
      p.prioridad,
      p.fechaCreacion,
      p.fechaEntrega,
      p.ingeniero,
      p.totalTareas
    ])
  });

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 12,
    head: [[
      'Proyecto con entrega',
      'Estado',
      'Prioridad',
      'Fecha entrega'
    ]],
    body: this.reporteDetallado.proyectosEntregaMes.map((p: any) => [
      p.nombre,
      p.estado,
      p.prioridad,
      p.fechaEntrega
    ])
  });

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 12,
    head: [[
      'Tarea',
      'Descripción',
      'Proyecto',
      'Ingeniero',
      'Estado',
      'Prioridad',
      'Fecha creación'
    ]],
    body: this.reporteDetallado.tareasCreadas.map((t: any) => [
      t.titulo,
      t.descripcion,
      t.proyecto,
      t.ingeniero,
      t.estado,
      t.prioridad,
      t.fechaCreacion
    ])
  });

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 12,
    head: [[
      'Usuario',
      'Correo',
      'Rol',
      'Estado',
      'Fecha creación'
    ]],
    body: this.reporteDetallado.usuariosCreados.map((u: any) => [
      u.nombre,
      u.correo,
      u.rol,
      u.estado,
      u.fechaCreacion
    ])
  });

  doc.save(`reporte-mensual-actividad-${this.mesSeleccionado}.pdf`);
}

  cargarIngenieros(): void {
    this.http.get<any>(`${this.apiUrl}/usuarios`).subscribe({
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

    this.http.post(`${this.apiUrl}/usuarios`, this.perfilForm).subscribe({
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

  this.http.post(`${this.apiUrl}/tareas`, this.tareaForm).subscribe({
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

