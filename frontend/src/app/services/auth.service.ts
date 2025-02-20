import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Replace with your backend URL (e.g., 'http://localhost:5000/api/users')
  private apiUrl = 'http://localhost:5000/api/users';

  constructor(private http: HttpClient) {}

  register(registerData: RegisterData): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, registerData);
  }
}
