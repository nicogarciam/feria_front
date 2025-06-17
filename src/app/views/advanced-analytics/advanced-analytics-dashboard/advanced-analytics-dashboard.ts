import { Component, OnInit } from '@angular/core';
import { WidgetConfig } from '../services/widget.service';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-advanced-analytics-dashboard',
  templateUrl: './advanced-analytics-dashboard.html',
  styleUrls: ['./advanced-analytics-dashboard.scss']
})
export class AdvancedAnalyticsDashboardComponent implements OnInit {

  dateRangeForm: FormGroup;
  categoryFilterControl: FormControl;
  categories = [
    {id: 'all', name: 'All Categories'},
    {id: 'electronics', name: 'Electronics'},
    {id: 'books', name: 'Books'},
    {id: 'clothing', name: 'Clothing'}
  ];

  salesWidgetConfig: WidgetConfig = {
    widgetType: 'sales-revenue',
    title: 'Sales Revenue Overview'
  };

  churnWidgetConfig: WidgetConfig = {
    widgetType: 'customer-churn',
    title: 'Customer Churn Rate'
  };

  salesByMonthWidgetConfig: WidgetConfig = {
    widgetType: 'sales-by-month',
    title: 'Sales by Month'
  };

  constructor() {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    this.dateRangeForm = new FormGroup({
      startDate: new FormControl(thirtyDaysAgo),
      endDate: new FormControl(today)
    });
    this.categoryFilterControl = new FormControl('all'); // Default to 'all'
  }

  ngOnInit(): void {
    this.dateRangeForm.valueChanges.subscribe(value => {
      this.onDateRangeChange(value);
    });

    this.categoryFilterControl.valueChanges.subscribe(value => {
      this.onCategoryFilterChange(value);
    });
  }

  onDateRangeChange(dateRange: { startDate: Date, endDate: Date }): void {
    console.log('Date range changed:', dateRange);
    // In a more complex scenario, you might combine dateRange and categoryFilter
    // into a single object to pass to widgets or trigger a unified update.
  }

  onCategoryFilterChange(category: string): void {
    console.log('Category filter changed:', category);
    // Similar to date range, this is where widgets would be notified.
  }
}
