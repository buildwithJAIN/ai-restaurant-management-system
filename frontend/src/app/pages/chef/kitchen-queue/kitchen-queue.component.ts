// frontend/src/app/pages/chef/kitchen-queue/kitchen-queue.component.ts
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChefService } from '../../../services/chef.service';
import { LoaderComponent } from '../../../components/loader/loader.component';

@Component({
  selector: 'app-kitchen-queue',
  standalone: true,
  imports: [CommonModule, LoaderComponent],
  templateUrl: './kitchen-queue.component.html',
  styleUrls: ['./kitchen-queue.component.scss']
})
export class KitchenQueueComponent implements OnInit, OnDestroy {
  private chefSvc = inject(ChefService);

  chefId = 0;
  orders = signal<any[]>([]);
  private timer: any;
  loading: boolean = false

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.chefId = user.id;
    this.fetch();
    // Light polling so orders vanish on claim by others
    this.timer = setInterval(() => this.fetch(), 3000);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  fetch() {
    // this.loading = true
    this.chefSvc.getPending().subscribe({
      next: (res) => this.orders.set(res),
      error: (err) => console.error('❌ load pending', err),
      // complete: () => {
      //   this.loading = false
      // }
    });
  }

  startCooking(orderId: number) {
    this.loading = true
    this.chefSvc.startCooking(orderId, this.chefId).subscribe({
      next: (res) => {
        if (res?.success) {
          // Remove from current list instantly for snappy UX
          this.orders.set(this.orders().filter(o => o.id !== orderId));
        } else {
          alert(res?.message || 'Order already taken by someone else');
        }
      },
      error: (err) => {
        console.error('❌ start cooking', err);
        alert('Failed to start order');
      },
      complete: () => {
        this.loading = false
      }
    });
  }
}
