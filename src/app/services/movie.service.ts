import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  vote_average: number;
  genre_ids: number[];
}

export interface MovieResponse {
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface MovieData {
    movieId: number;
    movieDetails: {
      title: string;
      overview: string;
      poster_path: string;
      vote_average: number;
    };
  }

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private tmdbApiUrl = 'https://api.themoviedb.org/3';
  private apiKey = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5N2I3MTAyM2I5OGJiMDY4MjE3ZWIxNzY1OTAzOGU2NCIsIm5iZiI6MTczMjkwODQ2OC40OTYsInN1YiI6IjY3NGExNWI0MDExNzg1MWNkMDFjMGE2YSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.WoIw_5fQONsvDN6U8ALKbpP9GRms8ibqzNq4tm_Z_6s'; 
  private backendUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  private getTmdbHeaders() {
    return new HttpHeaders({
      'accept': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    });
  }

  getPopularMovies(page: number = 1): Observable<MovieResponse> {
    return this.http.get<MovieResponse>(
      `${this.tmdbApiUrl}/discover/movie`, {
        headers: this.getTmdbHeaders(),
        params: {
          include_adult: 'false',
          include_video: 'false',
          language: 'en-US',
          page: page.toString(),
          sort_by: 'popularity.desc'
        }
      }
    );
  }

  getMoodBasedRecommendations(mood: string, page: number = 1): Observable<MovieResponse> {
    // Moods to genre IDs
    const moodGenreMap: { [key: string]: number[] } = {
      happy: [35, 10751], // Comedy, Family
      sad: [18, 10749],   // Drama, Romance
      excited: [28, 12],   // Action, Adventure
      relaxed: [16, 14]    // Animation, Fantasy
    };

    const genreIds = moodGenreMap[mood.toLowerCase()] || [];
    
    return this.http.get<MovieResponse>(
      `${this.tmdbApiUrl}/discover/movie`, {
        headers: this.getTmdbHeaders(),
        params: {
          with_genres: genreIds.join(','),
          page: page.toString(),
          sort_by: 'popularity.desc'
        }
      }
    );
  }

  getSimilarMovies(movieId: number): Observable<MovieResponse> {
    return this.http.get<MovieResponse>(
      `${this.tmdbApiUrl}/movie/${movieId}/similar`,
      { headers: this.getTmdbHeaders() }
    );
  }

  addMovieToUserList(userId: number, movieData: MovieData): Observable<any> {
    return this.http.post(`${this.backendUrl}/user/${userId}/movies`, movieData);
  }
}