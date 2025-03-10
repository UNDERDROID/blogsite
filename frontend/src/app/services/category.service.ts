import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface categoryData{
  name: string;
}

export interface tagData{
  name: string;
  category_id: number;
}

@Injectable({
  providedIn: 'root'
})

export class CategoryService {
  private apiUrl = 'http://localhost:5000/api/category'; 

  constructor(private http: HttpClient) {}

  createCategory(catData: categoryData): Observable<any>{
      const token = localStorage.getItem('authToken') || '';
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`
        });
    return this.http.post(this.apiUrl, catData, { headers });
  }

  updateCategory( catId: number, catData: {name: string}): Observable<any>{
    const token = localStorage.getItem('authToken')||'';
    const headers = new HttpHeaders({
      Authorizatioin: `Bearer ${token}`
    });
    return this.http.put(`${this.apiUrl}/${catId}`, catData);
  }

  deleteCategory(catId: number): Observable<any>{
    const token = localStorage.getItem('authToken') || '';
    const headers = new HttpHeaders({
      Authorization: `Bearer${token}`
    });
    return this.http.delete(`${this.apiUrl}/${catId}`, { headers });
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(this.apiUrl);
  }

  createTag(tagData: tagData):Observable<any>{
    const token = localStorage.getItem('authToken') || '';
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.post('http://localhost:5000/api/tag', tagData, {headers});
  }

  getTags(): Observable<string[]> {
    return this.http.get<string[]>('http://localhost:5000/api/tag'); 
  }

  deleteTags(tagId: number): Observable<any>{
    const token = localStorage.getItem('authToken') || '';
    const headers = new HttpHeaders({
      Authorization: `Bearer${token}`
    });
    return this.http.delete(`http://localhost:5000/api/tag/${tagId}`, { headers });
  }

  updateTags( tagId: number, tagData: {name: string, category_id: number}){
    const token = localStorage.getItem('authToken') || '';
    const headers = new HttpHeaders({
      Authorization: `Bearer${token}`
    });
    return this.http.put(`http://localhost:5000/api/tag/${tagId}`, tagData, { headers });
  }
}
