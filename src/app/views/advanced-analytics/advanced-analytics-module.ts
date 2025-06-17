import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { AdvancedAnalyticsRoutingModule } from './advanced-analytics-routing-module';
import { AdvancedAnalyticsDashboardComponent } from './advanced-analytics-dashboard/advanced-analytics-dashboard';
import { WidgetService } from './services/widget.service';
import { WidgetHostComponent } from './components/widget-host/widget-host.component';
import { SalesRevenueWidgetComponent } from './widgets/sales-revenue-widget/sales-revenue-widget.component';
import { CustomerChurnWidgetComponent } from './widgets/customer-churn-widget/customer-churn-widget.component';
import { BaseWidgetComponent } from './components/base-widget/base-widget.component';
import { SalesByMonthWidgetComponent } from './widgets/sales-by-month-widget/sales-by-month-widget.component'; // Import new widget

@NgModule({
  declarations: [
    AdvancedAnalyticsDashboardComponent,
    WidgetHostComponent,
    SalesRevenueWidgetComponent,
    CustomerChurnWidgetComponent,
    BaseWidgetComponent,
    SalesByMonthWidgetComponent // Declare new widget
  ],
  imports: [
    CommonModule,
    AdvancedAnalyticsRoutingModule,
    MatCardModule,
    NgxChartsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatSnackBarModule
  ],
  providers: [WidgetService],
  exports: [WidgetHostComponent], // Export WidgetHostComponent
  entryComponents: [ // For dynamic component loading (older Angular versions)
    SalesRevenueWidgetComponent,
    CustomerChurnWidgetComponent,
    SalesByMonthWidgetComponent // Add new widget to entryComponents
  ]
})
export class AdvancedAnalyticsModule { }
