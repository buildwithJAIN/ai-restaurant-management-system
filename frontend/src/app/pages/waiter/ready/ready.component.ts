import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmModalComponent } from '../../../components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-ready',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent],
  templateUrl: './ready.component.html',
  styleUrls: ['./ready.component.scss']
})
export class WaiterReadyComponent implements OnInit, OnDestroy {

  orders: any[] = [];
  waiterId = 0;
  apiBase = 'http://localhost:5000/api';
  private timer: any;

  showConfirm = false;
  selectedOrder: any = null;
  selectedItems: any[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit() {
    console.log("Waiter Ready Page Loaded");

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.waiterId = user.id;

    this.loadReadyItems();
    // this.timer = setInterval(() => this.loadReadyItems(), 3000);
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  /* =====================================================
      🟡 LOAD ONLY READY ITEMS FOR THIS WAITER
  ===================================================== */
  loadReadyItems() {
    this.http.get(`${this.apiBase}/orders/waiter-ready/${this.waiterId}`).subscribe({
      next: (res: any) => {
        this.orders = res;
      },
      error: err => console.error('❌ Error fetching ready items:', err)
    });
  }

  /* =====================================================
      🍽 SELECT ITEMS, SHOW CONFIRM MODAL
  ===================================================== */
  askMarkServed(order: any) {
    const selected = order.orderItems.filter((i: any) => i.selected);

    if (selected.length === 0) {
      alert("Please select at least one item to serve.");
      return;
    }

    this.selectedOrder = order;
    this.selectedItems = selected;

    this.showConfirm = true; // open modal
  }

  /* =====================================================
      🍽 CONFIRM SERVING ITEMS
  ===================================================== */
  handleConfirm(result: boolean) {
    if (!result) return;

    const orderId = this.selectedOrder.id;
    const itemIds = this.selectedItems.map(i => i.id);

    this.markItemsServed(orderId, itemIds);
  }

  /* =====================================================
      🍽 UPDATE ITEM STATUS → SERVED
  ===================================================== */
  markItemsServed(orderId: number, itemIds: number[]) {
    this.http.patch(`${this.apiBase}/orders/mark-items-served`, {
      orderId,
      items: itemIds
    }).subscribe({
      next: (res: any) => {
        // Remove served items from UI
        this.selectedOrder.orderItems = this.selectedOrder.orderItems.filter(
          (i: any) => !itemIds.includes(i.id)
        );

        // If order now has no ready items, remove entire order
        this.orders = this.orders.filter(o => o.orderItems.length > 0);
      },
      error: err => console.error('❌ Error marking items served:', err)
    });
  }
}
