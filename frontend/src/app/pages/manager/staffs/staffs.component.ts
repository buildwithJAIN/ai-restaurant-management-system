import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { LoaderComponent } from '../../../components/loader/loader.component';

@Component({
  selector: 'app-staffs',
  standalone: true,
  imports: [CommonModule, FormsModule, LoaderComponent],
  templateUrl: './staffs.component.html',
  styleUrls: ['./staffs.component.scss'],
})
export class StaffsComponent implements OnInit {
  loading: boolean = false
  staffList: any[] = [];

  // Main modal visibility and type
  showModal = false;
  isEditMode = false;

  // Delete confirmation modal
  showDeleteModal = false;
  deleteTarget: any = null;

  // Form data
  formData: any = {
    id: null,
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    gender: '',
    role: 'Waiter',
    password: '',
  };
  confirmPassword = '';

  private apiUrl = 'http://localhost:5000/api/staff';


  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.loadStaffs();
  }

  // 🔹 Load all staff
  loadStaffs() {
    this.loading = true
    this.http.get(this.apiUrl).subscribe({
      next: (res: any) => (this.staffList = res || []),
      error: (err) => console.error('❌ Error loading staff:', err),
      complete: () => {
        this.loading = false
      },
    });
  }

  // 🔹 Open Create modal
  openCreateModal() {

    this.isEditMode = false;
    this.resetForm();
    this.showModal = true;
  }

  // 🔹 Open Edit modal (prefill data)
  openEditModal(staff: any) {
    this.isEditMode = true;
    this.showModal = true;
    this.formData = {
      id: staff.id,
      firstName: staff.firstName,
      lastName: staff.lastName,
      username: staff.username,
      email: staff.email,
      gender: staff.gender,
      role: staff.role,
      password: '',
    };
    this.confirmPassword = '';
  }

  // 🔹 Close main modal
  closeModal() {
    this.showModal = false;
  }

  // 🔹 Reset form to empty
  resetForm() {
    this.formData = {
      id: null,
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      gender: '',
      role: 'Waiter',
      password: '',
    };
    this.confirmPassword = '';
  }

  // 🔹 Create or Update
  onSubmit() {
    if (this.formData.password !== this.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    this.loading = true
    if (this.isEditMode) {
      // 🟠 UPDATE EXISTING STAFF
      const payload = { ...this.formData };
      delete payload.id;
      this.loading = true
      this.http.put(`${this.apiUrl}/${this.formData.id}`, payload).subscribe({
        next: () => {
          this.showModal = false;
          this.loadStaffs();
        },
        error: (err) => {
          console.error(err);
          alert('Error updating staff');
        },
        complete: () => {
          this.loading = false
        },
      });
    } else {
      // 🟢 CREATE NEW STAFF\
      this.http.post(this.apiUrl, this.formData).subscribe({
        next: () => {
          this.showModal = false;
          this.loadStaffs();
        },
        error: (err) => {
          console.error(err);
          alert('Error creating staff');
        },
        complete: () => {
          this.loading = false
        },
      });
    }
  }

  // 🔹 Open delete confirmation modal
  openDeleteModal(staff: any) {
    this.deleteTarget = staff;
    this.showDeleteModal = true;
  }

  // 🔹 Close delete modal
  closeDeleteModal() {
    this.showDeleteModal = false;
    this.deleteTarget = null;
  }

  // 🔹 Confirm delete
  confirmDelete() {
    if (!this.deleteTarget) return;

    this.loading = true; // ✅ Show loader

    console.log("🧾 Attempting to delete:", this.deleteTarget);

    this.http.delete(`${this.apiUrl}/${this.deleteTarget.id}`).subscribe({
      next: () => {
        console.log("✅ Deleted successfully");
        this.showDeleteModal = false;
        this.loadStaffs();
      },
      error: (err) => {
        console.error("❌ Backend error deleting staff:", err);
        // ✅ Handle special backend message
        const backendMsg = err?.error?.message || 'Error deleting staff';
        alert(backendMsg);
      },
      complete: () => {
        this.loading = false; // ✅ Stop loader
      },
    });
  }

}
