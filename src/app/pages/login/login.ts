import { AfterViewInit, ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

declare global {
  interface Window {
    google: any;
  }
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements AfterViewInit {
  correo = '';
  password = '';

  mostrarPassword = false;
  cargando = false;

  errorMensaje = '';
  exitoMensaje = '';

  mostrarModalCorreo = false;
  mostrarModalCodigo = false;
  mostrarModalNuevaPassword = false;

  recuperarForm = {
    correo: '',
    codigo: '',
    nuevaPassword: '',
    confirmarPassword: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdRef: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
  setTimeout(() => {
    this.inicializarGoogle();
  }, 1500);
}

inicializarGoogle(): void {
  if (!window.google || !window.google.accounts || !window.google.accounts.id) {
    console.warn('Google no está cargado');
    return;
  }

  const elemento = document.getElementById('googleButton');

  if (!elemento) {
    console.warn('No existe el div googleButton');
    return;
  }

  elemento.innerHTML = '';

  window.google.accounts.id.initialize({
    client_id: '259621471041-fh6r8fgail775sanremlln4ria49n5rd.apps.googleusercontent.com',
    callback: (response: any) => this.loginConGoogle(response)
  });

  window.google.accounts.id.renderButton(elemento, {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    text: 'signin_with',
    shape: 'rectangular',
    width: 280
  });
}

  loginConGoogle(response: any): void {
    this.limpiarMensajes();
    this.cargando = true;

    if (!response?.credential) {
      this.cargando = false;
      this.errorMensaje = 'No se recibió credencial de Google';
      this.cdRef.detectChanges();
      return;
    }

    this.authService.loginConGoogle(response.credential).subscribe({
      next: (res: any) => {
        this.cargando = false;

        localStorage.setItem('token', res.token);
        localStorage.setItem('usuario', JSON.stringify(res.usuario));

        const rol = res.usuario.rol;

        if (rol === 'admin') {
          this.router.navigate(['/admin']);
        } else if (rol === 'ingeniero') {
          this.router.navigate(['/ingeniero']);
        } else {
          this.errorMensaje = 'Rol no permitido';
        }

        this.cdRef.detectChanges();
      },
      error: (error: any) => {
        this.cargando = false;
        this.errorMensaje = error?.error?.mensaje || 'Error con Google';
        this.cdRef.detectChanges();
      }
    });
  }

  login(): void {
    this.limpiarMensajes();

    if (!this.correo.trim() && !this.password.trim()) {
      this.errorMensaje = 'Debes ingresar correo y contraseña';
      return;
    }

    if (!this.correo.trim()) {
      this.errorMensaje = 'El correo es obligatorio';
      return;
    }

    if (!this.validarCorreo(this.correo)) {
      this.errorMensaje = 'Correo inválido';
      return;
    }

    if (!this.password.trim()) {
      this.errorMensaje = 'La contraseña es obligatoria';
      return;
    }

    this.cargando = true;

    this.authService.login(this.correo, this.password).subscribe({
      next: (response: any) => {
        this.cargando = false;

        localStorage.setItem('token', response.token);
        localStorage.setItem('usuario', JSON.stringify(response.usuario));

        const rol = response.usuario.rol;

        if (rol === 'admin') {
          this.router.navigate(['/admin']);
        } else if (rol === 'ingeniero') {
          this.router.navigate(['/ingeniero']);
        } else {
          this.errorMensaje = 'Rol no permitido';
        }

        this.cdRef.detectChanges();
      },
      error: (error: any) => {
        this.cargando = false;
        this.errorMensaje = error?.error?.mensaje || 'Credenciales inválidas';
        this.cdRef.detectChanges();
      }
    });
  }

  togglePassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  abrirModalRecuperar(): void {
    this.limpiarMensajes();
    this.recuperarForm = {
      correo: '',
      codigo: '',
      nuevaPassword: '',
      confirmarPassword: ''
    };

    this.mostrarModalCorreo = true;
    this.mostrarModalCodigo = false;
    this.mostrarModalNuevaPassword = false;
    this.cdRef.detectChanges();
  }

  cerrarTodosLosModales(): void {
    this.mostrarModalCorreo = false;
    this.mostrarModalCodigo = false;
    this.mostrarModalNuevaPassword = false;
    this.limpiarMensajes();
    this.cdRef.detectChanges();
  }

  enviarCodigo(): void {
    this.limpiarMensajes();

    if (!this.recuperarForm.correo.trim()) {
      this.errorMensaje = 'Debes ingresar el correo';
      return;
    }

    this.authService.enviarCodigoRecuperacion(this.recuperarForm.correo).subscribe({
      next: (response: any) => {
        this.exitoMensaje = response?.mensaje || 'Código enviado';

        setTimeout(() => {
          this.mostrarModalCorreo = false;
          this.mostrarModalCodigo = true;
          this.cdRef.detectChanges();
        }, 800);
      },
      error: (error: any) => {
        this.errorMensaje = error?.error?.mensaje || 'Error al enviar código';
        this.cdRef.detectChanges();
      }
    });
  }

  verificarCodigo(): void {
    this.limpiarMensajes();

    if (!this.recuperarForm.codigo.trim()) {
      this.errorMensaje = 'Ingresa el código';
      return;
    }

    this.authService.verificarCodigoRecuperacion(
      this.recuperarForm.correo,
      this.recuperarForm.codigo
    ).subscribe({
      next: () => {
        this.mostrarModalCodigo = false;
        this.mostrarModalNuevaPassword = true;
        this.cdRef.detectChanges();
      },
      error: (error: any) => {
        this.errorMensaje = error?.error?.mensaje || 'Código inválido';
        this.cdRef.detectChanges();
      }
    });
  }

  restablecerPassword(): void {
    this.limpiarMensajes();

    if (!this.recuperarForm.nuevaPassword.trim()) {
      this.errorMensaje = 'Nueva contraseña requerida';
      return;
    }

    if (this.recuperarForm.nuevaPassword !== this.recuperarForm.confirmarPassword) {
      this.errorMensaje = 'No coinciden';
      return;
    }

    this.authService.restablecerPassword(
      this.recuperarForm.correo,
      this.recuperarForm.nuevaPassword
    ).subscribe({
      next: () => {
        this.cerrarTodosLosModales();
      },
      error: (error: any) => {
        this.errorMensaje = error?.error?.mensaje || 'Error';
        this.cdRef.detectChanges();
      }
    });
  }

  volverACorreo(): void {
    this.mostrarModalCorreo = true;
    this.mostrarModalCodigo = false;
    this.mostrarModalNuevaPassword = false;
  }

  volverACodigo(): void {
    this.mostrarModalCorreo = false;
    this.mostrarModalCodigo = true;
    this.mostrarModalNuevaPassword = false;
  }

  limpiarMensajes(): void {
    this.errorMensaje = '';
    this.exitoMensaje = '';
  }

  validarCorreo(correo: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
  }
}