import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

const TOKEN_KEY = 'auth-token';
const USER_KEY = 'auth-user';

interface JwtPayload {
  sub?: string;
  iat?: number; // seconds
  exp?: number; // seconds
  [k: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class TokenStorageService {
  constructor(private router: Router) {}

  signOut(): void {
    window.localStorage.clear(); // ✅ đổi từ session -> local
  }

  public saveToken(token: string): void {
    window.localStorage.removeItem(TOKEN_KEY); // ✅
    window.localStorage.setItem(TOKEN_KEY, token); // ✅
  }

  public getToken(): any {
    return localStorage.getItem(TOKEN_KEY); // ✅
  }

  public saveUser(user: any): void {
    window.localStorage.removeItem(USER_KEY); // ✅
    window.localStorage.setItem(USER_KEY, JSON.stringify(user)); // ✅
  }

  public getUser(): any {
    const user = localStorage.getItem(USER_KEY); // ✅
    return user ? JSON.parse(user) : null;
  }

  isTokenExpired(token?: string | null): boolean {
    try {
      token = token ?? this.getToken();
      if (!token) return true;

      const payload = this.decodeJwt(token);
      if (!payload?.exp) return true;

      const nowSec = Math.floor(Date.now() / 1000);
      console.log('Token exp:', payload.exp, 'Now:', nowSec);

      return nowSec >= payload.exp;
    } catch (e) {
      console.error('JWT decode error:', e);
      return true;
    }
  }

  private decodeJwt(token: string): JwtPayload {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid JWT format');

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    const json = atob(base64);
    return JSON.parse(json);
  }
}
