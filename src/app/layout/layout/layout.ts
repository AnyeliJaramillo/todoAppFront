import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class LayoutComponent {
  usuario: any = null;
  modoOscuro = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.usuario = this.authService.getUsuario();

    const modoGuardado = localStorage.getItem('modoOscuro');
    this.modoOscuro = modoGuardado === 'true';
  }

  get esAdmin(): boolean {
    return this.usuario?.rol === 'admin';
  }

  get esIngeniero(): boolean {
    return this.usuario?.rol === 'ingeniero';
  }

  toggleModoOscuro(): void {
    this.modoOscuro = !this.modoOscuro;
    localStorage.setItem('modoOscuro', String(this.modoOscuro));
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}