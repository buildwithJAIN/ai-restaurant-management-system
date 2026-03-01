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
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  loading = false;

  // ------------------------------------------------------
  // CATEGORY MASTER
  // ------------------------------------------------------
  showCategoryModal = false;
  categories: any[] = [];
  categoryName = '';
  editingId: number | null = null;
  private categoryApi = 'http://localhost:5000/api/categories';

  // ------------------------------------------------------
  // AI PROMPT TYPES
  // ------------------------------------------------------
  showAIModal = false;

  itemDescriptionPrompt = ''; // For item descriptions
  menuPrompt = '';            // For PDF → menu import

  private aiApi = 'http://localhost:5000/api/ai/prompt';

  // ------------------------------------------------------
  // AI MENU PDF IMPORT
  // ------------------------------------------------------
  showPDFModal = false;
  selectedPDF: File | null = null;
  importMessage = '';
  private pdfApi = 'http://localhost:5000/api/aimenu/import-pdf';

  constructor(private http: HttpClient) { }

  ngOnInit() { }

  // ------------------------------------------------------
  // CATEGORY MASTER
  // ------------------------------------------------------
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

    this.http.get(this.categoryApi).subscribe({
      next: (res: any) => (this.categories = res || []),
      error: (err) => console.error('❌ Error fetching categories:', err),
      complete: () => (this.loading = false),
    });
  }

  saveCategory() {
    if (!this.categoryName.trim()) return;

    const payload = { name: this.categoryName };
    this.loading = true;

    const req = this.editingId
      ? this.http.put(`${this.categoryApi}/${this.editingId}`, payload)
      : this.http.post(this.categoryApi, payload);

    req.subscribe({
      next: () => {
        this.categoryName = '';
        this.editingId = null;
        this.loadCategories();
      },
      error: (err) => console.error('❌ Error saving category:', err),
      complete: () => (this.loading = false),
    });
  }

  editCategory(cat: any) {
    this.categoryName = cat.name;
    this.editingId = cat.id;
  }

  deleteCategory(id: number) {
    if (!confirm('Are you sure you want to delete this category?')) return;

    this.loading = true;

    this.http.delete(`${this.categoryApi}/${id}`).subscribe({
      next: () => this.loadCategories(),
      error: (err) => console.error('❌ Error deleting category:', err),
      complete: () => (this.loading = false),
    });
  }

  // ------------------------------------------------------
  // AI PROMPT — ITEM DESCRIPTION
  // ------------------------------------------------------
  openAIModal() {
    this.showAIModal = true;
    this.loadItemDescriptionPrompt();
  }

  closeAIModal() {
    this.showAIModal = false;
  }

  loadItemDescriptionPrompt() {
    this.loading = true;

    this.http.get(`${this.aiApi}?type=item_description`).subscribe({
      next: (res: any) => {
        this.itemDescriptionPrompt = res?.prompt || '';
      },
      error: (err) => console.error('❌ Error fetching item description prompt:', err),
      complete: () => (this.loading = false),
    });
  }

  saveItemDescriptionPrompt() {
    if (!this.itemDescriptionPrompt.trim())
      return alert('Please enter a prompt.');

    this.loading = true;

    this.http
      .post(this.aiApi, {
        type: 'item_description',
        prompt: this.itemDescriptionPrompt,
      })
      .subscribe({
        next: () => {
          alert('✅ Item description prompt saved!');
          this.closeAIModal();
        },
        error: (err) =>
          console.error('❌ Error saving item description prompt:', err),
        complete: () => (this.loading = false),
      });
  }

  // ------------------------------------------------------
  // AI MENU IMPORT — MENU PROMPT
  // ------------------------------------------------------
  openPDFModal() {
    this.showPDFModal = true;
    this.importMessage = '';
    this.selectedPDF = null;

    this.loadMenuPrompt();
  }

  loadMenuPrompt() {
    this.loading = true;

    this.http.get(`${this.aiApi}?type=menu_import`).subscribe({
      next: (res: any) => {
        this.menuPrompt = res?.prompt || '';
      },
      error: (err) => console.error('❌ Error loading menu import prompt:', err),
      complete: () => (this.loading = false),
    });
  }

  closePDFModal() {
    this.showPDFModal = false;
    this.selectedPDF = null;
    this.importMessage = '';
  }

  onPDFSelected(event: any) {
    this.selectedPDF = event.target.files[0] || null;
  }

  uploadPDF() {
    if (!this.selectedPDF) {
      alert('Please select a PDF file first.');
      return;
    }

    const formData = new FormData();
    formData.append('menuFile', this.selectedPDF);

    // Send the prompt with the upload
    formData.append('prompt', this.menuPrompt);

    this.loading = true;

    this.http.post(this.pdfApi, formData).subscribe({
      next: (res: any) => {
        this.importMessage = `✅ Imported ${res?.items || 0} menu items!`;
        alert('AI Menu Import Successful!');
      },
      error: (err) => {
        console.error('❌ Error importing PDF:', err);
        this.importMessage = '❌ Failed to import menu.';
      },
      complete: () => (this.loading = false),
    });
  }
  saveMenuPrompt() {
    if (!this.menuPrompt.trim()) {
      return alert("Please enter a menu import prompt.");
    }

    this.loading = true;

    this.http.post(this.aiApi, {
      type: "menu_import",
      prompt: this.menuPrompt
    }).subscribe({
      next: () => {
        alert("✅ Menu import prompt saved!");
      },
      error: (err) => console.error("❌ Error saving menu prompt:", err),
      complete: () => this.loading = false
    });
  }

}
