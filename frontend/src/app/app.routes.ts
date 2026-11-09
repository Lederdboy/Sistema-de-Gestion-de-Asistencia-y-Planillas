import { Routes } from '@angular/router';
import { MainLayoutComponent } from './components/layout/main-layout.component';
import { LoginComponent } from './components/views/login.component';
import { DashboardComponent } from './components/views/dashboard.component';
import { PersonalComponent } from './components/views/personal.component';
import { TareoComponent } from './components/views/tareo.component';
import { PlanillaComponent } from './components/views/planilla.component';
import { VacacionesComponent } from './components/views/vacaciones.component';
import { ReportesComponent } from './components/views/reportes.component';
import { PerfilComponent } from './components/views/perfil.component';
import { ConfigComponent } from './components/views/config.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'personal', component: PersonalComponent },
      { path: 'tareo', component: TareoComponent },
      { path: 'vacaciones', component: VacacionesComponent },
      { path: 'planilla', component: PlanillaComponent },
      { path: 'reportes', component: ReportesComponent },
      { path: 'perfil', component: PerfilComponent },
      { path: 'config', component: ConfigComponent },
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
