import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, user } from '@angular/fire/auth';

export interface User {
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);

  // Expose the Firebase user as a signal (using angular/fire rx-to-signal interop or just listening)
  // For simplicity, we manage our own signal state
  currentUser = signal<User | null>(null);

  constructor() {
    // Listen to Firebase auth state changes
    this.auth.onAuthStateChanged((user) => {
      if (user && user.email) {
        this.currentUser.set({ email: user.email });
      } else {
        this.currentUser.set(null);
      }
    });
  }

  async login(email: string, password: string): Promise<boolean> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
      this.router.navigate(['/dashboard']);
      return true;
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  }

  async register(email: string, password: string): Promise<boolean> {
    try {
      await createUserWithEmailAndPassword(this.auth, email, password);
      this.router.navigate(['/dashboard']);
      return true;
    } catch (error) {
      console.error('Registration failed', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }
}
