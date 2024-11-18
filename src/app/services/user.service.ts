import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // Login Method
  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { username, password });
  }

  // Get Movies for a User
  getUserMovies(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/${userId}/movies`);
  }

  // Add Movie to a User's List
  addUserMovie(userId: number, movieId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/${userId}/movies`, { movieId });
  }
}
