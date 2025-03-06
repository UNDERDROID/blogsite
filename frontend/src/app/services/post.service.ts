import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs';

export interface PostData {
  title: string;
  content: string;
  categories: string[]; 
  tags: string[];       
  createdBy?: number;   
}

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = 'http://localhost:5000/api/posts';

  constructor(private http: HttpClient) {
    const authToken = localStorage.getItem('authToken');
  }
  
  createPost(postData: PostData): Observable<any> {
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
      return throwError(() => new Error('Authentication token not found'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${authToken}`, 
      'Content-Type': 'application/json'
    });
    

    // // Log the exact data we're sending to help debug
    // console.log('Sending post data:', JSON.stringify(postData));
    
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

  getPostsForList(page: number = 1 , pageSize: number = 10): Observable<any>{
    const token = localStorage.getItem('authToken') || '';
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get(`${this.apiUrl}/by-size?page=${page}&pageSize=${pageSize}`, { headers });
  }

  deletePost(postId: number): Observable<any>{
    const token = localStorage.getItem('authToken')
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    }) 

    return this.http.delete(`${this.apiUrl}/${postId}`, { headers });
  }

}
