import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from '../../../components/loader/loader.component';

@Component({
  selector: 'app-completed',
  standalone: true,
  imports: [CommonModule, LoaderComponent],
  templateUrl: './completed.component.html',
  styleUrls: ['./completed.component.scss']
})
export class CompletedComponent implements OnInit {
  loading = false;
  orders: any[] = [];
  private apiBase = 'http://localhost:5000/api/chef/orders/completed';

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.loadCompletedOrders();
  }

  loadCompletedOrders() {
    this.loading = true;
    this.http.get(this.apiBase).subscribe({
      next: (res: any) => this.orders = Array.isArray(res) ? res : [],
      error: (err) => console.error('❌ Error fetching completed orders:', err),
      complete: () => this.loading = false,
    });
  }
}
