import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { LoaderComponent } from '../../../components/loader/loader.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule, LoaderComponent, FormsModule],
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.scss']
})
export class BillingComponent implements OnInit {

  loading = false;
  billings: any[] = [];
  apiBase = 'http://localhost:5000/api';

  showModal = false;
  selectedBilling: any = null;
  paymentMethod: string = 'Cash';

  waiterId = 0;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.waiterId = user.id;

    this.fetchBillings();
  }

  /** 🧾 Fetch active billings for THIS WAITER only */
  fetchBillings() {
    this.loading = true;

    this.http.get(`${this.apiBase}/billing/waiter/${this.waiterId}`)
      .subscribe({
        next: (res: any) => {
          this.billings = res || [];
        },
        error: err => console.error("❌ Error loading billings:", err),
        complete: () => this.loading = false
      });
  }

  /** 🟧 Open billing summary modal */
  openSummary(billing: any) {
    this.selectedBilling = billing;
    this.paymentMethod = 'Cash';
    this.showModal = true;
  }

  /** ❌ Close modal */
  closeModal() {
    this.showModal = false;
    this.selectedBilling = null;
  }

  /** 🟢 Complete billing */
  completeBilling() {
    if (!this.selectedBilling?.canBill) {
      alert("⚠️ All orders must be served before billing.");
      return;
    }

    this.loading = true;

    this.http.post(
      `${this.apiBase}/billing/close/${this.selectedBilling.id}`,
      { paymentMethod: this.paymentMethod }
    )
      .subscribe({
        next: () => {
          alert("✅ Billing completed!");
          this.closeModal();
          this.fetchBillings();
        },
        error: () => alert("❌ Error completing billing"),
        complete: () => this.loading = false
      });
  }

  /** 💰 Calculate total */
  total(b: any) {
    return b.totalAmount?.toFixed(2) ?? "0.00";
  }
}
