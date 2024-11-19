import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent {
  username: string = '';
  password: string = '';
  confirmPassword: string = '';
  message: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  createAccount() {
    if (this.password !== this.confirmPassword) {
      this.message = 'Passwords do not match.';
      return;
    }

    const payload = { username: this.username, password: this.password };

    this.http.post('http://localhost:3000/users', payload).subscribe({
      next: (response: any) => {
        console.log('Account created successfully:', response);
        this.message = 'Account created successfully! Redirecting to login...';

        // Redirect to login page after a short delay
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        console.error('Error creating account:', err);
        this.message =
          err.error.message || 'Failed to create account. Please try again.';
      },
    });
  }
}
