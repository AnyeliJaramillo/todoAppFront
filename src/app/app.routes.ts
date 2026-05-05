import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { AdminComponent } from './pages/admin/admin';
import { Ingeniero } from './pages/ingeniero/ingeniero';
import { ProyectosComponent } from './pages/proyectos/proyectos';
import { Tareas } from './pages/tareas/tareas';
import { LayoutComponent } from './layout/layout/layout';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';
import { UsuariosComponent } from './pages/usuarios/usuarios';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },

  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'admin',
        component: AdminComponent,
        canActivate: [roleGuard],
        data: { rol: 'admin' }
      },
      {
        path: 'proyectos',
        component: ProyectosComponent,
        canActivate: [roleGuard],
        data: { rol: 'admin' }
      },
      {
        path: 'tareas',
        component: Tareas,
        canActivate: [authGuard]
      },
      {
        path: 'usuarios',
        component: UsuariosComponent,
        canActivate: [roleGuard],
        data: { rol: 'admin' }
      },
      {
  path: 'ingeniero',
  component: Ingeniero,
  canActivate: [authGuard, roleGuard],
  data: { rol: 'ingeniero' }
},
{
  path: 'ingeniero/proyectos',
  component: Ingeniero,
  canActivate: [authGuard, roleGuard],
  data: { rol: 'ingeniero' }
},
{
  path: 'ingeniero/tareas',
  component: Ingeniero,
  canActivate: [authGuard, roleGuard],
  data: { rol: 'ingeniero' }
}
    ]
  },

  { path: '**', redirectTo: 'login' }
];