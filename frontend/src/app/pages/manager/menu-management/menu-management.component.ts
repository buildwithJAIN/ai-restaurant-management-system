import { Component, OnInit, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MenuService } from '../../../services/menu.services';
import { MenuItem } from '../../../models/menu-Item.model';
import { RouterModule } from '@angular/router';
import { LoaderComponent } from '../../../components/loader/loader.component';
import { AIService } from '../../../services/ai.service';

@Component({
  selector: 'app-menu-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LoaderComponent],
  templateUrl: './menu-management.component.html',
  styleUrls: ['./menu-management.component.scss'],
})
export class MenuManagementComponent implements OnInit {
  private fb = inject(FormBuilder);
  private menuSvc = inject(MenuService);
  private http = inject(HttpClient);
  private aiSvc = inject(AIService)
  items = signal<MenuItem[]>([]);
  loading = signal<boolean>(false);
  showModal = signal<boolean>(false);
  modalTitle = signal<string>('Create Menu Item');
  editingId = signal<number | null>(null);
  loader: boolean = false;

  // new reactive states
  uploading = signal<boolean>(false);
  previewUrl = signal<string | null>(null);
  selectedFile: File | null = null;

  // category data
  categories: any[] = [];
  private categoryApi = 'http://localhost:5000/api/categories';

  form: FormGroup = this.fb.group({
    itemName: ['', [Validators.required, Validators.minLength(2)]],
    category: ['', [Validators.required]], // will populate dynamically
    price: [0, [Validators.required, Validators.min(0)]],
    totalAvailable: [0, [Validators.required, Validators.min(0)]],
    description: [''],
    available: [true],
  });

  ngOnInit(): void {
    this.fetch();
    this.loadCategories(); // ✅ fetch categories for dropdown
  }

  // ✅ Load existing menu items
  fetch() {
    this.loader = true
    this.menuSvc.list().subscribe({
      next: (list) => {
        console.log('✅ Menu list:', list);
        this.items.set(list || []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('❌ Error fetching menu items:', err);
      },
      complete: () => {
        this.loader = false
      },
    });
  }


  // ✅ Load categories dynamically
  loadCategories() {
    this.http.get(this.categoryApi).subscribe({
      next: (res: any) => {
        this.categories = res || [];
      },
      error: (err) => {
        console.error('❌ Error loading categories:', err);
      },
    });
  }

  // ✅ Open create modal
  openCreate() {
    this.modalTitle.set('Create Menu Item');
    this.editingId.set(null);
    this.form.reset({
      itemName: '',
      category: this.categories.length ? this.categories[0].name : '', // auto-select first category
      price: 0,
      totalAvailable: 0,
      description: '',
      available: true,
    });
    this.previewUrl.set(null);
    this.selectedFile = null;
    this.showModal.set(true);
    document.body.style.overflow = 'hidden'; // prevent background scroll
  }

  // ✅ Open edit modal
  openEdit(item: MenuItem) {
    console.log(item)
    this.modalTitle.set('Edit Menu Item');
    this.editingId.set(item.id ?? null);
    this.form.reset({
      itemName: item.itemName,
      category: item.category,
      price: item.price,
      totalAvailable: item.totalAvailable,
      description: item.description || '',
      available: item.available,
    });
    this.previewUrl.set(item.imageUrl || null);
    this.selectedFile = null;
    this.showModal.set(true);
    document.body.style.overflow = 'hidden';
  }

  // ✅ Close modal
  closeModal() {
    this.showModal.set(false);
    document.body.style.overflow = 'auto';
  }

  // 🟢 Close modal on pressing ESC key
  @HostListener('document:keydown.escape')
  handleEscape() {
    if (this.showModal()) this.closeModal();
  }

  // 🟢 Handle file selection + preview
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => this.previewUrl.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  // 🟢 Create or Update item with image
  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    Object.entries(this.form.value).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.loader = true;
    if (!this.editingId()) {
      // 🟢 Create

      console.log(this.items)
      this.menuSvc.create(formData).subscribe({
        next: (created) => {
          this.items.update((arr) => [created, ...arr]);
          this.closeModal();
        },
        error: (err) => {
          console.error('❌ Error creating item:', err);
        },
        complete: () => {
          this.loader = false;
        },
      });
    } else {
      // 🟠 Update

      console.log(this.items)
      this.menuSvc.update(this.editingId()!, formData).subscribe({
        next: (updated) => {
          this.items.update((arr) =>
            arr.map((i) => (i.id === updated.id ? updated : i))
          );
          this.closeModal();
        },
        error: (err) => {
          console.error('❌ Error updating item:', err);
        },
        complete: () => {
          this.loader = false;
        },
      });
    }
  }

  // 🗑️ Delete item
  delete(item: MenuItem, e: MouseEvent) {
    e.stopPropagation();
    if (!item.id) return;
    if (!confirm(`Delete "${item.itemName}"?`)) return;
    this.menuSvc.remove(item.id).subscribe({
      next: () => this.items.update((arr) => arr.filter((i) => i.id !== item.id)),
    });
  }

  generateWithAI() {
    const name = this.form.get('itemName')?.value?.trim();
    const category = this.form.get('category')?.value?.trim();
    const imageUrl = this.form.get('imageUrl')?.value?.trim(); // or however you store it

    if (!name || !category) {
      alert('Please enter both Item Name and Category first.');
      return;
    }

    // Ask if image should be used
    const includeImage = confirm('Do you want to include the image in AI generation?');

    this.loading.set(true);

    this.aiSvc.generateDescription({
      name,
      category,
      imageUrl: includeImage ? imageUrl : null
    }).subscribe({
      next: (res) => {
        this.form.patchValue({ description: res.description });
        alert('✅ Description generated successfully!');
        this.loading.set(false);
      },
      error: (err) => {
        console.error('❌ AI generation failed:', err);
        alert('AI generation failed.');
        this.loading.set(false);
      },
    });
  }

}
