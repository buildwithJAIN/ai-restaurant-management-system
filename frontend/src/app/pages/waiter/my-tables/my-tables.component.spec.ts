import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTablesComponent } from './my-tables.component';

describe('MyTablesComponent', () => {
  let component: MyTablesComponent;
  let fixture: ComponentFixture<MyTablesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyTablesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyTablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
