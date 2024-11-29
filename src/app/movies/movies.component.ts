import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MovieService, Movie } from '../services/movie.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-movies',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './movies.component.html',
  styleUrls: ['./movies.component.css'],
})
export class MoviesComponent implements OnInit {
  movies: string[] = [];
  userId: number | null = null;
  errorMessage: string = '';
  isLoading: boolean = true;
  recommendations: Movie[] = [];
  selectedMood: string = '';
  popularMovies: Movie[] = [];
  moods: string[] = ['Happy', 'Sad', 'Excited', 'Relaxed'];

  constructor(
    private route: ActivatedRoute, 
    private movieService: MovieService, 
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.userId = params['userId'] ? +params['userId'] : null;
      if (this.userId) {
        this.fetchUserMovies(this.userId);
        this.fetchPopularMovies();
      } else {
        this.errorMessage = 'User ID not found.';
        this.isLoading = false;
      }
    });
  }

  fetchUserMovies(userId: number): void {
    const apiUrl = `http://localhost:3000/user/${userId}/movies`;
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

  fetchPopularMovies(): void {
    this.movieService.getPopularMovies().subscribe({
      next: (response) => {
        this.popularMovies = response.results;
      },
      error: (error) => {
        console.error('Error fetching popular movies:', error);
      }
    });
  }

  getMoodBasedRecommendations(): void {
    if (this.selectedMood) {
      this.movieService.getMoodBasedRecommendations(this.selectedMood)
        .subscribe({
          next: (response) => {
            this.recommendations = response.results;
          },
          error: (error) => {
            console.error('Error getting recommendations:', error);
          }
        });
    }
  }

  addToMyList(movie: Movie): void {
    if (this.userId) {
      this.movieService.addMovieToUserList(this.userId, movie).subscribe({
        next: () => {
          this.fetchUserMovies(this.userId!);
        },
        error: (error) => {
          console.error('Error adding movie:', error);
        }
      });
    }
  }
}