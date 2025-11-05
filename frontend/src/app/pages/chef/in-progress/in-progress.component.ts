import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { LoaderComponent } from '../../../components/loader/loader.component';

@Component({
  selector: 'app-in-progress',
  standalone: true,
  imports: [CommonModule, LoaderComponent],
  templateUrl: './in-progress.component.html',
  styleUrls: ['./in-progress.component.scss']
})
export class InProgressComponent implements OnInit {
  loading = false;
  chefId: number = 0;
  orders: any[] = [];
  private apiBase = 'http://localhost:5000/api/chef';

  constructor(private http: HttpClient) { }

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.chefId = user.id;
    this.loadInProgressOrders();
  }

  loadInProgressOrders() {
    this.loading = true;
    this.http.get(`${this.apiBase}/orders/in-progress/${this.chefId}`).subscribe({
      next: (res: any) => {
        this.orders = Array.isArray(res) ? res : [];
      },
      error: (err) => {
        console.error('❌ Error fetching in-progress orders:', err);
      },
      complete: () => (this.loading = false),
    });
  }

  markReady(orderId: number) {
    if (!confirm('Mark this order as ready?')) return;
    this.loading = true;

    this.http.patch(`${this.apiBase}/orders/ready/${orderId}`, {}).subscribe({
      next: () => {
        this.orders = this.orders.filter(o => o.id !== orderId);
      },
      error: (err) => {
        console.error('❌ Error marking ready:', err);
        alert('Failed to update order');
      },
      complete: () => (this.loading = false),
    });
  }
}
