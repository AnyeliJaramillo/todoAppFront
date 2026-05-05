import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsuariosService, Usuario } from '../../core/services/usuarios.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css'
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  cargando = false;

  mostrarModal = false;
  modoEdicion = false;
  usuarioEditandoId = '';

  cerrandoMensaje = false;
  mostrarConfirmarEliminar = false;
  usuarioEliminarId = '';

  mensaje = '';
  mostrarMensaje = false;
  tipoMensaje: 'success' | 'error' = 'success';

  usuarioForm: Usuario = {
    nombre: '',
    correo: '',
    password: '',
    rol: 'ingeniero',
    activo: true
  };

  constructor(
  private usuariosService: UsuariosService,
  private cdRef: ChangeDetectorRef
) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

cargarUsuarios(): void {
  this.cargando = true;

  this.usuariosService.obtenerUsuarios().subscribe({
    next: (respuesta: any) => {

      const lista = Array.isArray(respuesta)
        ? respuesta
        : Array.isArray(respuesta?.data)
        ? respuesta.data
        : [];

      this.usuarios = lista.filter((u: any) => u.rol === 'ingeniero');
      this.cargando = false;
      this.cdRef.detectChanges();
    },
    error: (error) => {
      console.error('Error al obtener usuarios', error);
      this.cargando = false;
      this.mostrarNotificacion('No se pudieron cargar los usuarios', 'error');
      this.cdRef.detectChanges();
    }
  });
}

  abrirModalNuevo(): void {
    this.modoEdicion = false;
    this.usuarioEditandoId = '';
    this.usuarioForm = {
      nombre: '',
      correo: '',
      password: '',
      rol: 'ingeniero',
      activo: true
    };
    this.mostrarModal = true;
  }

  abrirModalEditar(usuario: Usuario): void {
    this.modoEdicion = true;
    this.usuarioEditandoId = usuario._id || '';
    this.usuarioForm = {
      nombre: usuario.nombre,
      correo: usuario.correo,
      password: '',
      rol: usuario.rol,
      activo: usuario.activo
    };
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  guardarUsuario(): void {
    if (
      !this.usuarioForm.nombre.trim() ||
      !this.usuarioForm.correo.trim()
    ) {
      this.mostrarNotificacion('Completa nombre y correo', 'error');
      return;
    }

    if (!this.modoEdicion && !this.usuarioForm.password?.trim()) {
      this.mostrarNotificacion('La contraseña es obligatoria', 'error');
      return;
    }

    if (this.modoEdicion) {
      const payload: Partial<Usuario> = {
        nombre: this.usuarioForm.nombre,
        correo: this.usuarioForm.correo,
        rol: 'ingeniero',
        activo: this.usuarioForm.activo
      };

      if (this.usuarioForm.password?.trim()) {
        payload.password = this.usuarioForm.password;
      }

      this.usuariosService.actualizarUsuario(this.usuarioEditandoId, payload).subscribe({
        next: () => {
          this.cerrarModal();
          this.cargarUsuarios();
          this.mostrarNotificacion('Usuario actualizado correctamente', 'success');
        },
        error: (error) => {
          console.error('Error al actualizar usuario', error);
          this.mostrarNotificacion(
            error?.error?.mensaje || 'No se pudo actualizar el usuario',
            'error'
          );
        }
      });
    } else {
      this.usuariosService.crearUsuario(this.usuarioForm).subscribe({
        next: () => {
          this.cerrarModal();
          this.cargarUsuarios();
          this.mostrarNotificacion('Usuario creado correctamente', 'success');
        },
        error: (error) => {
          console.error('Error al crear usuario', error);
          this.mostrarNotificacion(
            error?.error?.mensaje || 'No se pudo crear el usuario',
            'error'
          );
        }
      });
    }
  }

  abrirConfirmarEliminar(id?: string): void {
  if (!id) return;

  this.usuarioEliminarId = id;
  this.mostrarConfirmarEliminar = true;
}

cerrarConfirmarEliminar(): void {
  this.mostrarConfirmarEliminar = false;
  this.usuarioEliminarId = '';
}

confirmarEliminarUsuario(): void {
  if (!this.usuarioEliminarId) return;

  this.usuariosService.eliminarUsuario(this.usuarioEliminarId).subscribe({
    next: () => {
      this.cerrarConfirmarEliminar();
      this.cargarUsuarios();
      this.mostrarNotificacion('Usuario eliminado correctamente', 'success');
    },
    error: (error) => {
      console.error('Error al eliminar usuario', error);
      this.cerrarConfirmarEliminar();
      this.mostrarNotificacion('No se pudo eliminar el usuario', 'error');
    }
  });
}

  mostrarModalVer = false;
usuarioSeleccionado: any = null;

abrirModalVer(usuario: any): void {
  this.usuarioSeleccionado = usuario;
  this.mostrarModalVer = true;
}

cerrarModalVer(): void {
  this.mostrarModalVer = false;
  this.usuarioSeleccionado = null;
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