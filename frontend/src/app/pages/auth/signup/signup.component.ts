import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  formData = {
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    gender: '',
    role: '',
    password: '',
  };
  confirmPassword = '';
  constructor(private http: HttpClient, private router: Router) { }

  onSubmit() {
    console.log("hello")
    console.log(this.formData)
    if (this.formData.password !== this.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    this.http
      .post('http://localhost:5000/api/auth/register', this.formData)
      .subscribe({
        next: (res: any) => {
          if (res && res.message == "User registered successfully") {
            alert('Account created successfully!');
            this.router.navigate(['/login']);
          }
        },
        error: (err) => {
          console.error(err);
          alert(err.error.message || 'Something went wrong.');
        }
      });
  }
}
