import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

/* ====== TYPES FOR REPORT DATA ====== */

interface SummaryReport {
  totalRevenue: number;
  activeBills: number;
  closedBills: number;
  totalOrders: number;
  totalItemsSold: number;
  customerCount: number;
}

interface ItemSales {
  itemId: number;
  name: string;
  quantitySold: number;
  revenue: number;
}

interface TimeBucket {
  label: string; // e.g. "10:00–11:00"
  orders: number;
  revenue: number;
}

interface SalesReport {
  itemSales: ItemSales[];
  topItem?: ItemSales | null;
  hourlyStats: TimeBucket[];
}

interface WaiterStats {
  waiterId: number;
  name: string;
  ordersTaken: number;
  ordersServed: number;
  revenue: number;
}

interface ChefStats {
  chefId: number;
  name: string;
  ordersPrepared: number;
  itemsCooked: number;
}

interface StaffReport {
  waiters: WaiterStats[];
  chefs: ChefStats[];
}

type HistoryRange = 'today' | 'week' | 'month';

interface BillingHistoryItem {
  billingId: number;
  tableNumber: string;
  waiterName: string;
  totalAmount: number;
  createdAt: string;
}

interface InventoryUsageItem {
  itemId: number;
  name: string;
  usedQty: number;
  remainingStock: number;
}

interface HistoryReport {
  billing: BillingHistoryItem[];
  inventory: InventoryUsageItem[];
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
})
export class ReportsComponent implements OnInit {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:5000/api/reports'; // TODO: move to environment

  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  summary = signal<SummaryReport | null>(null);
  sales = signal<SalesReport | null>(null);
  staff = signal<StaffReport | null>(null);
  history = signal<HistoryReport | null>(null);

  selectedRange = signal<HistoryRange>('today');
  // Controls collapse/expand for each report section
  sectionExpanded = {
    summary: true,
    sales: true,
    staff: true,
    history: true
  };

  ngOnInit(): void {
    this.loadAllReports();
  }

  loadAllReports(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      summary: this.http.get<SummaryReport>(`${this.baseUrl}/summary`),
      sales: this.http.get<SalesReport>(`${this.baseUrl}/sales`),
      staff: this.http.get<StaffReport>(`${this.baseUrl}/staff`),
      history: this.http.get<HistoryReport>(`${this.baseUrl}/history`, {
        params: { range: this.selectedRange() },
      }),
    }).subscribe({
      next: (result) => {
        this.summary.set(result.summary);
        this.sales.set(result.sales);
        this.staff.set(result.staff);
        this.history.set(result.history);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('❌ Failed to load reports', err);
        this.error.set('Failed to load reports. Please try again.');
        this.loading.set(false);
      },
    });
  }
  sortItemSales(field: 'quantitySold' | 'revenue', direction: 'asc' | 'desc') {
    const data = this.sales()?.itemSales || [];
    data.sort((a, b) =>
      direction === 'asc'
        ? a[field] - b[field]
        : b[field] - a[field]
    );

    // Update signal to trigger UI update
    this.sales.set({
      ...this.sales()!,
      itemSales: [...data]
    });
  }
  toggleSection(section: keyof typeof this.sectionExpanded): void {
    this.sectionExpanded[section] = !this.sectionExpanded[section];
  }
  collapseAll() {
    Object.keys(this.sectionExpanded).forEach(key => {
      this.sectionExpanded[key as keyof typeof this.sectionExpanded] = false;
    });
  }

  expandAll() {
    Object.keys(this.sectionExpanded).forEach(key => {
      this.sectionExpanded[key as keyof typeof this.sectionExpanded] = true;
    });
  }

  sortHourly(field: 'orders' | 'revenue', direction: 'asc' | 'desc') {
    const data = this.sales()?.hourlyStats || [];
    data.sort((a, b) =>
      direction === 'asc'
        ? a[field] - b[field]
        : b[field] - a[field]
    );

    this.sales.set({
      ...this.sales()!,
      hourlyStats: [...data]
    });
  }

  onRangeChange(range: HistoryRange): void {
    if (this.selectedRange() === range) return;
    this.selectedRange.set(range);
    this.loadHistoryOnly();
  }

  private loadHistoryOnly(): void {
    this.loading.set(true);
    this.http
      .get<HistoryReport>(`${this.baseUrl}/history`, {
        params: { range: this.selectedRange() },
      })
      .subscribe({
        next: (history) => {
          this.history.set(history);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('❌ Failed to load history report', err);
          this.error.set('Failed to load billing & inventory data.');
          this.loading.set(false);
        },
      });
  }

  /* Helpers for template */

  getTopItemName(): string {
    const s = this.sales();
    if (!s || !s.topItem) return '-';
    return `${s.topItem.name} (${s.topItem.quantitySold} sold)`;
  }

  getWaiterTotal(): number {
    const s = this.staff();
    if (!s) return 0;
    return s.waiters.length;
  }

  getChefTotal(): number {
    const s = this.staff();
    if (!s) return 0;
    return s.chefs.length;
  }
}