import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KitchenQueueComponent } from './kitchen-queue.component';

describe('KitchenQueueComponent', () => {
  let component: KitchenQueueComponent;
  let fixture: ComponentFixture<KitchenQueueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KitchenQueueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KitchenQueueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
