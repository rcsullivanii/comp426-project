import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-update-password',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './update-password.component.html',
  styleUrl: './update-password.component.css'
})
export class UpdatePasswordComponent implements OnInit {
  newPassword: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  userId: number | null = null; // Property to store the user ID

  constructor(
    private http: HttpClient, 
    private router: Router,
    private route: ActivatedRoute)
  {}
  

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.userId = params['userId'] ? +params['userId'] : null;
      if (this.userId) {
        console.log('User ID:', this.userId);
      } else {
        this.errorMessage = 'User ID not found.';
      }
    });
  }

  updatePassword(): void {
    if (!this.userId) {
      this.errorMessage = 'User ID is not available. Cannot update password.';
      return;
    }
    const apiUrl = `http://localhost:3000/user/${this.userId}/password`;

    this.http.put(apiUrl, { newPassword: this.newPassword })
      .subscribe({
        next: () => {
          this.successMessage = "Password updated successfully!";
          this.errorMessage = '';
        },
        error: (error) => {
          this.errorMessage = error.error.message || "Failed to update password.";
          this.successMessage = '';
        }
      });
  }
}
