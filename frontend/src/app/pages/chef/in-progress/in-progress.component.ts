import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { LoaderComponent } from '../../../components/loader/loader.component';
import { ConfirmModalComponent } from '../../../components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-in-progress',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,               // ⭐ Required for ngModel checkbox binding
    LoaderComponent,
    ConfirmModalComponent
  ],
  templateUrl: './in-progress.component.html',
  styleUrls: ['./in-progress.component.scss']
})
export class InProgressComponent implements OnInit {

  loading = false;
  chefId: number = 0;
  orders: any[] = [];

  showConfirm = false;
  selectedOrder: any = null;   // ⭐ Store order object
  selectedItems: any[] = [];   // ⭐ Store selected items for that order

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

  // ⭐ Step 1 — When chef clicks “Mark Selected Ready”
  askMarkReady(order: any) {
    const selected = order.orderItems.filter((i: any) => i.selected);

    if (selected.length === 0) {
      alert("Please select at least one item.");
      return;
    }

    this.selectedOrder = order;
    this.selectedItems = selected;
    this.showConfirm = true;
  }

  // ⭐ Step 2 — Handle confirmation from modal
  handleConfirm(result: boolean) {
    if (!result) return;

    const orderId = this.selectedOrder.id;
    const itemIds = this.selectedItems.map(i => i.id);

    this.markSelectedItemsReady(orderId, itemIds);
    this.loadInProgressOrders()
  }

  // ⭐ Step 3 — API call to update only selected items
  markSelectedItemsReady(orderId: number, itemIds: number[]) {
    this.loading = true;

    this.http.patch(`${this.apiBase}/orders/mark-items-ready`, {
      orderId,
      items: itemIds
    }).subscribe({
      next: () => {
        // Remove only the items that became ready
        this.selectedOrder.orderItems = this.selectedOrder.orderItems.filter(
          (i: any) => !itemIds.includes(i.id)
        );
      },
      error: (err) => {
        console.error('❌ Error marking items ready:', err);
        alert('Failed to update items');
      },
      complete: () => (this.loading = false),
    });
  }
}
