import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancedAnalyticsDashboard } from './advanced-analytics-dashboard';

describe('AdvancedAnalyticsDashboard', () => {
  let component: AdvancedAnalyticsDashboard;
  let fixture: ComponentFixture<AdvancedAnalyticsDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvancedAnalyticsDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdvancedAnalyticsDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
