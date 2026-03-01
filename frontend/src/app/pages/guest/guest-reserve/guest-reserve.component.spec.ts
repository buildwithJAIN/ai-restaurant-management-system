import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuestReserveComponent } from './guest-reserve.component';

describe('GuestReserveComponent', () => {
  let component: GuestReserveComponent;
  let fixture: ComponentFixture<GuestReserveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuestReserveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuestReserveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
