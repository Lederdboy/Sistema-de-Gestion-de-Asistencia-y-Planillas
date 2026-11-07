import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { PlanillasStateService } from './services/planillas-state.service';
import { LoginComponent } from './components/login/login.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TopbarComponent } from './components/topbar/topbar.component';
import { ToastComponent } from './components/toast/toast.component';
import { DashboardComponent } from './components/views/dashboard/dashboard.component';
import { PersonalComponent } from './components/views/personal/personal.component';
import { TareoComponent } from './components/views/tareo/tareo.component';
import { VacacionesComponent } from './components/views/vacaciones/vacaciones.component';
import { PlanillaComponent } from './components/views/planilla/planilla.component';
import { ReportesComponent } from './components/views/reportes/reportes.component';
import { ConfigComponent } from './components/views/config/config.component';
import { PerfilComponent } from './components/views/perfil/perfil.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    LoginComponent,
    SidebarComponent,
    TopbarComponent,
    ToastComponent,
    DashboardComponent,
    PersonalComponent,
    TareoComponent,
    VacacionesComponent,
    PlanillaComponent,
    ReportesComponent,
    ConfigComponent,
    PerfilComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  auth = inject(AuthService);
  state = inject(PlanillasStateService);
}
