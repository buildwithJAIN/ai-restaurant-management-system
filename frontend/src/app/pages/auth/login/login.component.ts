import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoaderComponent } from '../../../components/loader/loader.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LoaderComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  identifier = '';  // can be email or username
  password = '';
  forgotPasswordMode: boolean = false;
  userExists: boolean = false;
  otpSent: boolean = false;
  otpVerified: boolean = false;
  resetIdentifier = '';
  otp = '';
  newPassword = '';
  confirmPassword = '';
  userVerification: boolean = false;
  loading: boolean = false

  constructor(private http: HttpClient, private router: Router) { }

  onSubmit() {
    const payload = {
      identifier: this.identifier,
      password: this.password
    };
    console.log(payload);

    this.loading = true
    this.http.post('http://localhost:5000/api/auth/login', payload)
      .subscribe({
        next: (res: any) => {
          console.log('✅ Login Successful');
          console.log('User details:', res.user);
          console.log('Token:', res.token);
          localStorage.setItem('token', res.token);                     // JWT
          localStorage.setItem('user', JSON.stringify(res.user));
          console.log(res.user)      // user info
          this.router.navigate([`/${res.user.role.toLowerCase()}`]);                         // redirect
        },
        error: (err) => {
          console.error('❌ Login failed:', err.error?.message);
          alert(err.error?.message || 'Invalid credentials.');
          this.loading = false
        },
        complete: () => {
          this.loading = false; // ✅ Stop loader after completion
        },
      });
  }

  onCheckUser() {
    console.log("checking User")
    this.http.post('http://localhost:5000/api/auth/check-user', { identifier: this.resetIdentifier })
      .subscribe({
        next: () => {
          this.otpSent = true;
          alert('✅ OTP sent to your registered email.');
        },
        error: () => alert('User not found.')
      });
  }

  // 🔐 Verify OTP function
  onCheckOtp() {
    console.log("checking otp")
    if (!this.resetIdentifier || !this.otp) {
      alert('Please enter both email and OTP.');
      return;
    }

    this.http.post('http://localhost:5000/api/auth/check-otp', {
      email: this.resetIdentifier,
      otp: this.otp
    }).subscribe({
      next: (res: any) => {
        if (res.valid) {
          alert('✅ OTP verified successfully!');
          this.otpVerified = true;
        } else {
          alert('❌ Invalid or expired OTP.');
        }
      },
      error: (err) => {
        console.error('❌ Error verifying OTP:', err);
        alert(err.error?.message || 'Something went wrong while verifying OTP.');
      }
    });
  }

  onResetPassword() {
    if (this.newPassword !== this.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    this.http.post('http://localhost:5000/api/auth/reset-password', {
      identifier: this.resetIdentifier,
      otp: this.otp,
      newPassword: this.newPassword
    }).subscribe({
      next: () => {
        alert('✅ Password reset successful! You can log in now.');
        this.forgotPasswordMode = false;
        this.otpSent = false;
        this.otpVerified = false;
        this.resetIdentifier = '';
        this.otp = '';
        this.newPassword = '';
        this.confirmPassword = '';
      },
      error: (err) => alert(err.error?.message || 'Invalid OTP or expired.')
    });
  }
}
