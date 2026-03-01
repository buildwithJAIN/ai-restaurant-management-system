import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-guest-reserve',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './guest-reserve.component.html',
  styleUrls: ['./guest-reserve.component.scss'],
})
export class GuestReserveComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);

  reserveForm = this.fb.group({
    guestName: ['', Validators.required],
    phone: ['', Validators.required],
    numPeople: [1, [Validators.required, Validators.min(1)]],
    dateTime: ['', Validators.required],
    specialNotes: [''],
  });

  submitting = false;
  successMessage = '';
  errorMessage = '';

  submitReservation() {
    if (this.reserveForm.invalid) return;

    this.submitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.http.post('/api/reservations', this.reserveForm.value).subscribe({
      next: (res: any) => {
        this.successMessage = res.message || 'Reservation request sent!';
        this.reserveForm.reset();
        this.submitting = false;
      },
      error: () => {
        this.errorMessage = 'Failed to send reservation. Please try again.';
        this.submitting = false;
      },
    });
  }
}
