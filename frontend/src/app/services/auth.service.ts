import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { error } from 'jquery';

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

  deleteUser(userId: number): Observable<any>{
    const token = localStorage.getItem('authToken') || '';
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    }) 
    return this.http.delete(`${this.apiUrl}/users/${userId}`, { headers }).pipe(
      catchError((error)=>{
        console.error('API error:', error);
      throw error;
    })
  )
  }

  updateUser(userId: number, updateData: {username?: string, email?: string, role?: string}): Observable<any>{
    const token = localStorage.getItem('authToken') || '';
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.patch(`${this.apiUrl}/users/${userId}`, updateData, { headers }).pipe(
      catchError((error) => {
        console.error('API error:', error);
        throw error;
      })
    )
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
