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
    window.sessionStorage.clear();
  }

  public saveToken(token: string): void {
    window.sessionStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.setItem(TOKEN_KEY, token);
  }

  public getToken(): any {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  public saveUser(user): void {
    window.sessionStorage.removeItem(USER_KEY);
    window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  public getUser(): any {
    return JSON.parse(sessionStorage.getItem(USER_KEY));
  }

  isTokenExpired(token?: string | null): boolean {
    try {
      token = token ?? this.getToken();
      if (!token) return true;

      const payload = this.decodeJwt(token);
      if (!payload?.exp) return true; // Không có exp => coi như hết hạn

      const nowSec = Math.floor(Date.now() / 1000);
      console.log('Token exp:', payload.exp, 'Now:', nowSec);

      return nowSec >= payload.exp; // now >= exp => HẾT HẠN
    } catch (e) {
      console.error('JWT decode error:', e);
      return true; // Lỗi giải mã => coi như invalid
    }
  }

  /**
   * Decode payload của JWT.
   * KHÔNG verify signature (front-end không verify được).
   */
  private decodeJwt(token: string): JwtPayload {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid JWT format');

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    const json = atob(base64); // decode base64
    return JSON.parse(json); // parse payload
  } 
}
