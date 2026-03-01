import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from '../../../components/loader/loader.component';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, LoaderComponent],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
})
export class OrdersComponent implements OnInit, OnDestroy {

  orders: any[] = [];
  waiterId: number = 0;

  loading = false;
  expandedCards: { [id: number]: boolean } = {};

  private timer: any;
  private apiBase = 'http://localhost:5000/api';

  constructor(private http: HttpClient) { }

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.waiterId = user.id;

    this.loadOrders();

    // 🔁 Auto-refresh every 3 seconds
    this.timer = setInterval(() => this.loadOrders(), 3000);
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  /* ============================================================
     FETCH ALL ORDERS FOR WAITER (Billing-aware)
  ============================================================ */
  loadOrders() {
    // this.loading = true;

    this.http.get(`${this.apiBase}/orders/waiter/${this.waiterId}`).subscribe({
      next: (res: any) => {
        // backend already returns latest orders with billing + table
        this.orders = Array.isArray(res) ? res : [];
        console.log("WAITER ORDERS:", this.orders);
      },
      error: err => console.error("❌ Error fetching orders", err),
      // complete: () => (this.loading = false)
    });
  }

  /* ============================================================
     EXPAND / COLLAPSE ITEMS PANEL
  ============================================================ */
  toggleItems(orderId: number) {
    if (this.expandedCards[orderId]) {
      this.expandedCards[orderId] = false;
      return;
    }

    // close all others
    Object.keys(this.expandedCards).forEach(id => {
      this.expandedCards[+id] = false;
    });

    // open this one
    this.expandedCards[orderId] = true;
  }

  /* ============================================================
     Waiter SHOULD NOT mark order as served (chef feature)
     BUT keeping function intact if needed later
  ============================================================ */
  markAsServed(orderId: number) {
    if (!confirm("Mark this order as served?")) return;

    this.loading = true;
    this.http
      .put(`${this.apiBase}/orders/${orderId}/status`, { status: 'Served' })
      .subscribe({
        next: () => {
          alert("Order marked as served!");
          this.loadOrders();
        },
        error: (err) => {
          console.error("❌ Error updating order status:", err);
          alert("Error updating order.");
        },
        complete: () => (this.loading = false),
      });
  }
}
