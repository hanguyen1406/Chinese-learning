import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_PATH } from '../../service/const';

const AUTH_API = `${API_PATH}/auth/`;

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'X-Skip-Loading': 'true',
  }),
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  login(credentials): Observable<any> {
    return this.http.post(
      AUTH_API + 'login',
      {
        username: credentials.username,
        password: credentials.password,
      },
      httpOptions
    );
  }

  register(user): Observable<any> {
    return this.http.post(
      AUTH_API + 'registration',
      {
        name: user.name,
        surname: user.surname,
        username: user.username,
        email: user.email,
        password: user.password,
      },
      httpOptions
    );
  }

  // Gửi OTP đến email
  sendOtp(email: string, username: string): Observable<any> {
    return this.http.post(
      AUTH_API + 'send-otp',
      { email, username },
      httpOptions
    );
  }

  // Xác thực OTP
  verifyOtp(email: string, otpCode: string): Observable<any> {
    return this.http.post(
      AUTH_API + 'verify-otp',
      { email, otpCode },
      httpOptions
    );
  }
}
