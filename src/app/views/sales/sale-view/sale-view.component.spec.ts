import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleViewComponent } from './sale-view.component';

describe('BookingViewComponent', () => {
  let component: SaleViewComponent;
  let fixture: ComponentFixture<SaleViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaleViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaleViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
