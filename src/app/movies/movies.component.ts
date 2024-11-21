import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-movies',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movies.component.html',
  styleUrls: ['./movies.component.css'],
})
export class MoviesComponent implements OnInit {
  movies: string[] = [];
  userId: number | null = null;
  errorMessage: string = '';
  isLoading: boolean = true;

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.userId = params['userId'] ? +params['userId'] : null;
      if (this.userId) {
        this.fetchUserMovies(this.userId);
      } else {
        this.errorMessage = 'User ID not found.';
        this.isLoading = false;
      }
    });
  }

  fetchUserMovies(userId: number): void {
    const apiUrl = `http://localhost:3000/user/${userId}/movies`; // Adjust the URL if your backend is hosted elsewhere

    this.http.get<{ title: string }[]>(apiUrl).subscribe({
      next: (data) => {
        this.movies = data.map((movie) => movie.title);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching movies:', error);
        this.errorMessage = error.error.message || 'Failed to load movies.';
        this.isLoading = false;
      },
    });
  }
}
