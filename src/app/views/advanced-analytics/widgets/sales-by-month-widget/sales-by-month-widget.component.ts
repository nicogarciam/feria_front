import { Component, OnInit } from '@angular/core';
import { BaseWidgetComponent, DateRange, ActiveFilters } from '../../components/base-widget/base-widget.component';
import { WidgetService } from '../../services/widget.service';

@Component({
  selector: 'app-sales-by-month-widget',
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>{{ widgetTitle }}</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <ngx-charts-bar-vertical
          [view]="view"
          [scheme]="colorScheme"
          [results]="filteredChartData"
          [xAxis]="showXAxis"
          [yAxis]="showYAxis"
          [legend]="showLegend"
          [showXAxisLabel]="showXAxisLabel"
          [showYAxisLabel]="showYAxisLabel"
          [xAxisLabel]="xAxisLabel"
          [yAxisLabel]="yAxisLabel">
        </ngx-charts-bar-vertical>
      </mat-card-content>
    </mat-card>
  `
})
export class SalesByMonthWidgetComponent extends BaseWidgetComponent implements OnInit {
  // Original chart data source
  private allChartData = [
    { name: 'Jan', value: 1200, category: 'electronics' },
    { name: 'Feb', value: 1500, category: 'electronics' },
    { name: 'Mar', value: 1800, category: 'books' },
    { name: 'Apr', value: 1300, category: 'clothing' },
    { name: 'May', value: 1600, category: 'books' },
    { name: 'Jun', value: 1900, category: 'electronics' },
    { name: 'Jan', value: 800, category: 'clothing' },
    { name: 'Feb', value: 900, category: 'books' },
    { name: 'Mar', value: 1100, category: 'clothing' },
    { name: 'Apr', value: 700, category: 'electronics' },
    { name: 'May', value: 1000, category: 'clothing' },
    { name: 'Jun', value: 1200, category: 'books' }
  ];

  filteredChartData = [];

  // Chart options
  view: [number, number] = [700, 400]; // width, height
  showXAxis = true;
  showYAxis = true;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Month';
  showYAxisLabel = true;
  yAxisLabel = 'Sales ($)';
  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA'] // Example color scheme
  };

  constructor(widgetService: WidgetService) { // Inject WidgetService
    super(widgetService); // Pass to base constructor
  }

  ngOnInit(): void {
    super.ngOnInit(); // Call base class ngOnInit
    if (!this.widgetTitle && this.widgetConfig) {
      this.widgetTitle = this.widgetConfig.title;
    }
    console.log(`${this.widgetConfig?.title}: Initial date range:`, this.dateRange);
    console.log(`${this.widgetConfig?.title}: Initial filters:`, this.activeFilters);
    this.applyFilters();
  }

  protected override onDateRangeChanged(newDateRange: DateRange): void {
    console.log(`${this.widgetConfig?.title}: Date range updated:`, newDateRange);
    // In a real app, you'd likely re-fetch data for the new range and category
    this.applyFilters();
  }

  protected override onFiltersChanged(newFilters: ActiveFilters): void {
    console.log(`${this.widgetConfig?.title}: Filters updated:`, newFilters);
    this.applyFilters();
  }

  private applyFilters(): void {
    let data = [...this.allChartData]; // Start with a copy of all data

    const category = this.activeFilters?.category;

    if (category && category !== 'all') {
      data = data.filter(item => item.category === category);
    }

    // Further filter by dateRange if necessary (not implemented here for brevity)
    // For example:
    // if (this.dateRange && this.dateRange.startDate && this.dateRange.endDate) {
    //   data = data.filter(item => {
    //     const itemDate = new Date(item.name + ' 1, 2024'); // Assuming year, adjust as needed
    //     return itemDate >= this.dateRange.startDate && itemDate <= this.dateRange.endDate;
    //   });
    // }

    // Aggregate data by month name after filtering by category
    // This is important if multiple data points for the same month exist after category filtering
    const aggregatedData = data.reduce((acc, curr) => {
        const existingMonth = acc.find(item => item.name === curr.name);
        if (existingMonth) {
            existingMonth.value += curr.value;
        } else {
            acc.push({ name: curr.name, value: curr.value });
        }
        return acc;
    }, []);


    this.filteredChartData = aggregatedData;
    console.log(`${this.widgetConfig?.title}: Data after filtering:`, this.filteredChartData);
  }
}
