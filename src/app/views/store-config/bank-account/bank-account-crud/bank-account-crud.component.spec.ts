import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BankAccountCrudComponent } from './bank-account-crud.component';

describe('BankAccountCrudComponent', () => {
  let component: BankAccountCrudComponent;
  let fixture: ComponentFixture<BankAccountCrudComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BankAccountCrudComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BankAccountCrudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
