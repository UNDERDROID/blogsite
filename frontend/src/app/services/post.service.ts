import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs';

export interface PostData {
  title: string;
  content: string;
  categories: string[]; // assuming backend expects category IDs
  tags: string[];       // assuming backend expects tag IDs
  createdBy?: number;   // optional, can be set in backend from token/session
}

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = 'http://localhost:5000/api/posts';

  constructor(private http: HttpClient) {}
  
  createPost(postData: PostData): Observable<any> {
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
      return throwError(() => new Error('Authentication token not found'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${authToken}`, 
      'Content-Type': 'application/json'
    });
    

    // Log the exact data we're sending to help debug
    console.log('Sending post data:', JSON.stringify(postData));
    
    return this.http.post(this.apiUrl, postData, { headers });
    catchError(error => {
      console.log('Raw server error:', error);
      // If the server returns detailed error information, log it
      if (error.error) {
        console.log('Server error details:', error.error);
      }
      return throwError(() => error);
    })
  }
}
