import { Injectable } from '@nativescript/core';
import { firebase } from '@nativescript/firebase-core';
import '@nativescript/firebase-auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: firebase.Auth;

  constructor() {
    this.auth = firebase.auth();
  }

  async login(email: string, password: string): Promise<firebase.User | null> {
    try {
      const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  getCurrentUser(): firebase.User | null {
    return this.auth.currentUser;
  }
}