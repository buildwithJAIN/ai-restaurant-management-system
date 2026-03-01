import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TableService } from '../../../services/table.service';
import { UserService } from '../../../services/user.service';
import { LoaderComponent } from '../../../components/loader/loader.component';

@Component({
  selector: 'app-table-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LoaderComponent],
  templateUrl: './table-management.component.html',
  styleUrls: ['./table-management.component.scss']
})
export class TableManagementComponent implements OnInit {
  private fb = inject(FormBuilder);
  private tableSvc = inject(TableService);
  private userSvc = inject(UserService);

  tables = signal<any[]>([]);
  waiters = signal<any[]>([]);
  showModal = signal(false);
  editingId = signal<number | null>(null);
  modalTitle = signal<string>('Create Table');
  loading: boolean = false;

  form: FormGroup = this.fb.group({
    tableNumber: ['', Validators.required],
    capacity: [1, Validators.required],
    assignedWaiterId: ['', Validators.required],
    available: [true]
  });

  ngOnInit() {
    this.loadTables();
    this.loadWaiters();
  }

  // 🧭 Load all tables
  loadTables() {
    this.loading = true;
    this.tableSvc.getTables().subscribe({
      next: (res) => {
        console.log('✅ Tables loaded:', res);
        this.tables.set(res);
      },
      error: (err) => {
        console.error('❌ Error loading tables:', err);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  // 👨‍🍳 Load all waiters for dropdown
  loadWaiters() {
    this.userSvc.getWaiters().subscribe({
      next: (res) => {
        this.waiters.set(res);
        console.log('✅ Waiters loaded:', res);
      },
      error: (err) => {
        console.error('❌ Error loading waiters:', err);
      }
    });
  }

  // ➕ Open modal for creating a table
  openModal() {
    this.form.reset({
      tableNumber: '',
      capacity: 1,
      assignedWaiterId: '',
      available: true
    });
    this.modalTitle.set('Create Table');
    this.showModal.set(true);
    this.editingId.set(null);
  }

  // 💾 Save (Create or Update) table
  saveTable() {
    if (this.form.invalid) return;
    this.loading = true;

    // Convert payload for backend compatibility
    const payload = {
      tableNumber: this.form.value.tableNumber,
      capacity: Number(this.form.value.capacity),
      waiterId: Number(this.form.value.assignedWaiterId),
      available: !!this.form.value.available
    };

    if (this.editingId()) {
      // ✏️ Update existing table
      this.tableSvc.updateTable(this.editingId()!, payload).subscribe({
        next: (res) => {
          console.log('✅ Table updated:', res);
          this.loadTables();
          this.showModal.set(false);
          this.editingId.set(null);
        },
        error: (err) => {
          console.error('❌ Error updating table:', err);
        },
        complete: () => {
          this.loading = false;
        }
      });
    } else {
      // 🆕 Create new table
      this.tableSvc.createTable(payload).subscribe({
        next: (res) => {
          console.log('✅ Table created:', res);
          this.loadTables();
          this.showModal.set(false);
        },
        error: (err) => {
          console.error('❌ Error creating table:', err);
        },
        complete: () => {
          this.loading = false;
        }
      });
    }
  }

  // 📝 Edit existing table
  onRowClick(table: any) {
    this.editingId.set(table.id);
    this.modalTitle.set('Edit Table');
    this.showModal.set(true);

    this.form.patchValue({
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      assignedWaiterId: table.waiterId, // ✅ correctly mapped
      available: table.available
    });
  }

  refreshTables() {
    this.loadTables()
  }
}
