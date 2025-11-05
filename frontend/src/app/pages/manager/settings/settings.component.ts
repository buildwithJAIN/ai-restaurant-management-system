import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoaderComponent } from '../../../components/loader/loader.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, LoaderComponent],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  loading = false;
  showCategoryModal = false;
  categories: any[] = [];
  categoryName = '';
  editingId: number | null = null;

  private apiUrl = 'http://localhost:5000/api/categories';

  constructor(private http: HttpClient) { }

  ngOnInit() { }

  // when clicking category card
  openCategoryModal() {
    this.showCategoryModal = true;
    this.loadCategories();
  }

  closeModal() {
    this.showCategoryModal = false;
    this.categoryName = '';
    this.editingId = null;
  }

  loadCategories() {
    this.loading = true;
    this.http.get(this.apiUrl).subscribe({
      next: (res: any) => (this.categories = res || []),
      error: (err) => console.error('❌ Error fetching categories:', err),
      complete: () => (this.loading = false)
    });
  }

  saveCategory() {
    if (!this.categoryName.trim()) return;

    const payload = { name: this.categoryName };
    this.loading = true;

    const request = this.editingId
      ? this.http.put(`${this.apiUrl}/${this.editingId}`, payload)
      : this.http.post(this.apiUrl, payload);

    request.subscribe({
      next: () => {
        this.categoryName = '';
        this.editingId = null;
        this.loadCategories();
      },
      error: (err) => console.error('❌ Error saving category:', err),
      complete: () => (this.loading = false)
    });
  }

  editCategory(cat: any) {
    this.categoryName = cat.name;
    this.editingId = cat.id;
  }

  deleteCategory(id: number) {
    if (!confirm('Are you sure you want to delete this category?')) return;
    this.loading = true;
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => this.loadCategories(),
      error: (err) => console.error('❌ Error deleting category:', err),
      complete: () => (this.loading = false)
    });
  }
}
