import { Injectable, signal } from '@angular/core';
import { User } from '../models/types';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  readonly currentUser = signal<User | null>(this.getInitialUser());

  private getInitialUser(): User | null {
    try {
      const saved = localStorage.getItem('planilla_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  login(user: User, rememberMe = true): void {
    this.currentUser.set(user);
    if (rememberMe) {
      try {
        localStorage.setItem('planilla_user', JSON.stringify(user));
      } catch {
        // storage disabled
      }
    }
  }

  logout(): void {
    this.currentUser.set(null);
    try {
      localStorage.removeItem('planilla_user');
    } catch {
      // storage disabled
    }
  }
}

