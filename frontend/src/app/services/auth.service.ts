import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

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
  private apiUrl = 'http://localhost:5000/api';
  private token = '';

  constructor(private http: HttpClient, private router: Router) {
    this.token=localStorage.getItem('authToken')??'';
  }

  register(registerData: RegisterData): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/register`, registerData);
  }

  login(username: string, password: string): Observable<any>{
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { username, password };
    return this.http.post<any>(`${this.apiUrl}/users/login`, body, { headers })
  }

  getPosts(): Observable<any[]> {
      const token = localStorage.getItem('authToken') || '';
    const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
    });
    return this.http.get<any[]>(`${this.apiUrl}/posts/fyp`, { headers });
  }

  getUsers(): Observable<any[]>{
    const token = localStorage.getItem('authToken') || '';
    const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
    });
    return this.http.get<any[]>(`${this.apiUrl}/users`,{ headers });
  }

  getAuthToken(): string {
    return localStorage.getItem('authToken') || '';
  }

  getUserRole(): string{
    return localStorage.getItem('userRole')?.replace(/"/g, '') || '';
  }

  logout(){
    localStorage.removeItem('userRole');
    localStorage.removeItem('authToken');
    this.router.navigate(['/login']);
  }
}
