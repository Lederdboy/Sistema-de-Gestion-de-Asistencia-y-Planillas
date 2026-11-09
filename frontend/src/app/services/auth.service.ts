import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';

export interface UserSession {
  name: string;
  email: string;
  originalEmail: string;
  role: string;
  avatarText: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSignal = signal<UserSession | null>(this.getStoredUser());
  user = this.userSignal.asReadonly();
  isAuthenticated = computed(() => !!this.userSignal());

  constructor(private router: Router) {}

  private getStoredUser(): UserSession | null {
    try {
      const saved = localStorage.getItem('planilla_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  login(email: string, pass: string, remember = true): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const isAdmin = email.toLowerCase().includes('admin');
        const session: UserSession = {
          name: isAdmin ? 'Carlos Mendoza (Admin)' : 'Patricia Vargas (RRHH)',
          email: isAdmin ? 'carlos.mendoza@minera-andina.com' : 'patricia.vargas@minera-andina.com',
          originalEmail: email,
          role: isAdmin ? 'Administrador General' : 'Especialista de Planillas',
          avatarText: isAdmin ? 'CM' : 'PV',
        };

        this.userSignal.set(session);
        if (remember) {
          try {
            localStorage.setItem('planilla_user', JSON.stringify(session));
          } catch {}
        }
        resolve(true);
      }, 400);
    });
  }

  logout() {
    this.userSignal.set(null);
    try {
      localStorage.removeItem('planilla_user');
    } catch {}
    this.router.navigate(['/login']);
  }
}

