import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const usuario = auth.getUsuario();
  const rolEsperado = route.data?.['rol'];

  if (usuario && usuario.rol === rolEsperado) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};