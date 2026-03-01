import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule],
  selector: 'app-host-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']

})
export class HostDashboardComponent implements OnInit {
  private http = inject(HttpClient);

  reservations = signal<any[]>([]);
  loading = signal<boolean>(true);
  error = signal<string>('');

  ngOnInit() {
    this.loadReservations();
  }

  loadReservations() {
    this.loading.set(true);
    this.http.get('/api/reservations/pending').subscribe({
      next: (res: any) => {
        this.reservations.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to fetch reservations.');
        this.loading.set(false);
      },
    });
  }

  updateReservation(id: number, status: string, tableId?: number) {
    this.http.put(`/api/reservations/${id}`, { status, tableId }).subscribe({
      next: () => this.loadReservations(),
      error: () => alert('Failed to update reservation'),
    });
  }
}
