import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MoviesComponent } from './movies/movies.component';
import { SignupComponent } from './signup/signup.component';
import { UpdatePasswordComponent } from './update-password/update-password.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'movies', component: MoviesComponent },
  { path: 'update-password', component: UpdatePasswordComponent },
];
