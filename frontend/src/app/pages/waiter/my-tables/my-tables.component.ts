import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LoaderComponent } from '../../../components/loader/loader.component';

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

  loading: boolean = false;

  // 🧾 Menu & order data
  categories: any[] = [];
  selectedCategory: any = null;
  totalItems: number = 0;
  totalPrice: number = 0;

  private apiBase = 'http://localhost:5000/api';

  constructor(private http: HttpClient) { }

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.waiterId = user.id;
    this.loadTables();
  }

  // 🟢 Load tables assigned to this waiter
  loadTables() {
    this.loading = true;
    this.http.get(`${this.apiBase}/tables/waiter/${this.waiterId}`).subscribe({
      next: (res: any) => {
        this.tables = res;
      },
      error: (err) => console.error('❌ Error loading tables', err),
      complete: () => (this.loading = false)
    });
  }

  // 🟠 When a table card is clicked
  selectTable(table: any) {
    this.selectedTable = table;
    this.fetchCategories();
  }

  // 🧾 Fetch menu categories and items
  fetchCategories() {
    this.loading = true;
    this.http.get<any[]>(`${this.apiBase}/menu`).subscribe({
      next: (res) => {
        if (!Array.isArray(res)) {
          console.error('❌ Invalid menu response:', res);
          this.loading = false;
          return;
        }

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
        console.log('✅ Categories ready:', this.categories);
      },
      error: (err) => {
        console.error('❌ Error fetching menu:', err);
        alert('Error fetching menu items');
      },
      complete: () => (this.loading = false)
    });
  }

  // 🔸 Select a category tab
  selectCategory(cat: any) {
    this.selectedCategory = cat;
  }

  // ➕ Increment item
  increment(item: any) {
    if (item.stock > 0) {
      item.qty++;
      item.stock--;
      this.updateTotals();
    }
  }

  // ➖ Decrement item
  decrement(item: any) {
    if (item.qty > 0) {
      item.qty--;
      item.stock++;
      this.updateTotals();
    }
  }

  // 🔄 Update totals
  updateTotals() {
    let totalQty = 0;
    let totalPrice = 0;

    this.categories.forEach(cat => {
      cat.items.forEach((item: { qty: number; price: number }) => {
        totalQty += item.qty;
        totalPrice += item.qty * item.price;
      });
    });

    this.totalItems = totalQty;
    // keep two decimals
    this.totalPrice = parseFloat(totalPrice.toFixed(2));
  }

  // ✅ Confirm order for selected table
  confirmOrder() {
    const orderedItems = this.categories
      .flatMap(cat => cat.items)
      .filter(i => i.qty > 0);

    if (orderedItems.length === 0) {
      alert('Please select at least one item.');
      return;
    }

    const orderPayload = {
      waiterId: this.waiterId,
      tableId: this.selectedTable.id,
      items: orderedItems.map(i => ({
        menuItemId: i.id,
        quantity: i.qty,
        price: i.price
      }))
    };

    this.loading = true;
    this.http.post(`${this.apiBase}/orders/create`, orderPayload).subscribe({
      next: (res: any) => {
        console.log('✅ Order created:', res);
        alert('✅ Order placed successfully and sent to kitchen!');
        this.clearSelection();
        this.loadTables(); // refresh table availability
      },
      error: (err) => {
        console.error('❌ Error placing order:', err);
        alert('Error placing order');
      },
      complete: () => (this.loading = false)
    });
  }

  // ❌ Cancel and clear everything
  clearSelection() {
    this.selectedTable = null;
    this.categories = [];
    this.selectedCategory = null;
    this.totalItems = 0;
    this.totalPrice = 0;
  }
}
