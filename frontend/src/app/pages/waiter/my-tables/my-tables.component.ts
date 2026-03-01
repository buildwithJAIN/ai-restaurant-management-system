import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LoaderComponent } from '../../../components/loader/loader.component';

// Proper typing for existing order items
type ExistingItem = {
  menuItemId: number;
  menuItemName: string;
  price: number;
  quantity: number;
  subTotal?: number;
};

@Component({
  selector: 'app-waiter-tables',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LoaderComponent],
  templateUrl: './my-tables.component.html',
  styleUrls: ['./my-tables.component.scss']
})
export class WaiterTablesComponent implements OnInit {

  waiterId: number = 0;
  tables: any[] = [];
  selectedTable: any = null;

  loading = false;

  // ORDER STATES
  categories: any[] = [];
  selectedCategory: any = null;

  existingItems: ExistingItem[] = [];     // previous order items
  isContinuing = false;

  totalItems: number = 0;        // new items only
  totalPrice: number = 0;

  showExistingModal = false;     // for popup modal

  private apiBase = 'http://localhost:5000/api';

  constructor(private http: HttpClient) { }

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.waiterId = user.id;
    this.loadTables();
  }

  /* ============================================================
     LOAD TABLES
  ============================================================ */
  loadTables() {
    this.loading = true;
    this.http.get(`${this.apiBase}/tables/waiter/${this.waiterId}`).subscribe({
      next: (res: any) => {
        console.log(res);
        // ⬇️ keep previous behaviour: only show available tables
        this.tables = res && res.filter((x: any) => x.available == true);   // includes currentOrder
      },
      error: err => console.error('❌ Error loading tables', err),
      complete: () => (this.loading = false)
    });
  }

  /* ============================================================
     TABLE ACTIONS
  ============================================================ */

  startOrder(table: any) {
    this.selectedTable = table;
    this.existingItems = [];
    this.isContinuing = false;
    this.showExistingModal = false;
    this.fetchCategories();
  }

  continueOrder(table: any) {
    this.selectedTable = table;
    this.isContinuing = true;
    this.existingItems = table.currentOrder?.items || [];
    this.showExistingModal = false;
    this.fetchCategories();
  }

  selectTable(table: any) {
    if (table.currentOrder) this.continueOrder(table);
    else this.startOrder(table);
  }

  /* ============================================================
     MENU CATEGORIES
  ============================================================ */

  fetchCategories() {
    this.loading = true;

    this.http.get<any[]>(`${this.apiBase}/menu`).subscribe({
      next: res => {
        const grouped = res.reduce((acc: any, item: any) => {
          const cat = item.category || 'Uncategorized';
          if (!acc[cat]) acc[cat] = [];

          acc[cat].push({
            id: item.id,
            name: item.itemName,
            price: item.price,
            stock: item.totalAvailable,
            image: item.imageUrl,
            qty: 0
          });

          return acc;
        }, {});

        this.categories = Object.keys(grouped).map((key, i) => ({
          id: i + 1,
          name: key,
          items: grouped[key]
        }));

        this.selectedCategory = this.categories[0] || null;
      },
      error: () => alert("Error loading menu"),
      complete: () => (this.loading = false)
    });
  }

  selectCategory(cat: any) {
    this.selectedCategory = cat;
  }

  /* ============================================================
     ITEM COUNTING
  ============================================================ */

  increment(item: any) {
    if (item.stock > 0) {
      item.qty++;
      item.stock--;
      this.updateTotals();
    }
  }

  decrement(item: any) {
    if (item.qty > 0) {
      item.qty--;
      item.stock++;
      this.updateTotals();
    }
  }

  updateTotals() {
    let qty = 0;
    let price = 0;

    this.categories.forEach(cat => {
      cat.items.forEach((i: any) => {
        qty += i.qty;
        price += i.qty * i.price;
      });
    });

    this.totalItems = qty;
    this.totalPrice = parseFloat(price.toFixed(2));
  }

  /* ============================================================
     SUBMIT ORDER
  ============================================================ */

  submitOrder() {
    const orderedItems = this.categories
      .flatMap(cat => cat.items)
      .filter(i => i.qty > 0);

    if (orderedItems.length === 0) {
      alert("Select at least one item.");
      return;
    }

    const payloadItems = orderedItems.map(i => ({
      menuItemId: i.id,
      quantity: i.qty,
      price: i.price
    }));

    const payload = {
      waiterId: this.waiterId,
      tableId: this.selectedTable.id,
      items: payloadItems
    };

    this.loading = true;

    this.http.post(`${this.apiBase}/orders/create`, payload).subscribe({
      next: () => {
        alert("Order created!");
        this.clearSelection();
        this.loadTables();
      },
      error: () => alert("Error placing order"),
      complete: () => (this.loading = false)
    });
  }


  /* ============================================================
     CLEAR PANEL
  ============================================================ */
  clearSelection() {
    this.selectedTable = null;
    this.categories = [];
    this.selectedCategory = null;

    this.existingItems = [];
    this.isContinuing = false;

    this.totalItems = 0;
    this.totalPrice = 0;

    this.showExistingModal = false;
  }

  /* ============================================================
     EXISTING ORDER MODAL
  ============================================================ */

  openExistingOrderModal() {
    if (this.existingItems.length > 0) {
      this.showExistingModal = true;
    }
  }

  closeExistingOrderModal() {
    this.showExistingModal = false;
  }

  calculateExistingOrderTotal(): string {
    const total = this.existingItems.reduce((sum, e) => {
      const qty = e.quantity;
      const price = e.subTotal ? e.subTotal : e.price * qty;
      return sum + price;
    }, 0);

    return total.toFixed(2);
  }
}
