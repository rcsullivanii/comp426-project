import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  message: string = '';

  constructor(private userService: UserService, private router: Router) {}

  navigateToCreateAccount() {
    this.router.navigate(['/signup']);
  }

  login() {
    this.userService.login(this.username, this.password).subscribe({
      next: (response) => {
        this.message = response.message;
        console.log('Login successful:', response);
        this.router.navigate(['/movies'], {
          queryParams: { userId: response.userId },
        });
      },
      error: (error) => {
        this.message = error.error.message;
        console.error('Login error:', error);
      },
    });
  }
}
