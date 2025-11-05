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

  public getToken(): string {
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
      if (!payload?.exp) return true; // không có exp coi như không hợp lệ
      const nowSec = Math.floor(Date.now() / 1000);
      return payload.exp <= nowSec;
    } catch {
      return true; // decode lỗi => coi như hết hạn/invalid
    }
  }
  private decodeJwt(token: string): JwtPayload {
    const base64Url = token.split('.')[1];
    if (!base64Url) throw new Error('Invalid JWT format');
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  }
}
