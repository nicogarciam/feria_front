import { Component, OnInit } from '@angular/core';
import { BaseWidgetComponent } from '../../components/base-widget/base-widget.component';

@Component({
  selector: 'app-customer-churn-widget',
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>{{ widgetTitle }}</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p>Displaying customer churn data...</p>
        <!-- Actual chart or data will go here -->
      </mat-card-content>
    </mat-card>
  `
})
export class CustomerChurnWidgetComponent extends BaseWidgetComponent implements OnInit {

  constructor() {
    super();
  }

  ngOnInit(): void {
    if (!this.widgetTitle && this.widgetConfig) {
      this.widgetTitle = this.widgetConfig.title;
    }
  }
}
