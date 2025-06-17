import { Component, OnInit } from '@angular/core';
import { BaseWidgetComponent } from '../../components/base-widget/base-widget.component';
import { WidgetService } from '../../services/widget.service';
import { RealTimeUpdate } from '../../interfaces/real-time.interface';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-sales-revenue-widget',
  styleUrls: ['./sales-revenue-widget.component.scss'], // Added for threshold style
  template: `
    <mat-card [class.threshold-exceeded-alert]="thresholdExceeded">
      <mat-card-header>
        <mat-card-title>{{ widgetTitle }}</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="mb-2">
          <mat-form-field appearance="fill">
            <mat-label>Set Revenue Threshold</mat-label>
            <input matInput type="number" [formControl]="thresholdControl" placeholder="e.g., 7000">
          </mat-form-field>
        </div>
        <p>Displaying sales revenue data...</p>
        <p *ngIf="currentRevenue !== undefined">Current Total Revenue: {{ currentRevenue | currency }}</p>
        <p *ngIf="revenueThreshold !== null">Threshold set at: {{ revenueThreshold | currency }}</p>
        <!-- Actual chart or data will go here -->
      </mat-card-content>
    </mat-card>
  `
})
export class SalesRevenueWidgetComponent extends BaseWidgetComponent implements OnInit {

  currentRevenue: number;
  thresholdControl = new FormControl();
  revenueThreshold: number | null = null;
  thresholdExceeded = false;

  constructor(
    widgetService: WidgetService,
    private snackBar: MatSnackBar // Inject MatSnackBar
  ) {
    super(widgetService);
  }

  ngOnInit(): void {
    super.ngOnInit();
    if (!this.widgetTitle && this.widgetConfig) {
      this.widgetTitle = this.widgetConfig.title;
    }
    this.currentRevenue = 0;

    this.thresholdControl.valueChanges.subscribe(value => {
      this.revenueThreshold = Number.isFinite(value) && value !== null ? Number(value) : null;
      // Reset thresholdExceeded when threshold changes, so alert can trigger again if new threshold is met
      this.thresholdExceeded = false;
      this.checkThreshold(this.currentRevenue);
    });
  }

  handleRealTimeUpdate(update: RealTimeUpdate): void {
    if (update.metric === 'totalRevenue') {
      this.currentRevenue = update.value;
      console.log(`${this.widgetConfig?.title}: Updated revenue: ${this.currentRevenue}`);
      this.checkThreshold(this.currentRevenue);
    }
  }

  checkThreshold(currentValue: number): void {
    if (this.revenueThreshold !== null && currentValue > this.revenueThreshold && !this.thresholdExceeded) {
      this.thresholdExceeded = true;
      const message = `${this.widgetConfig.title}: Revenue ${currentValue} exceeded threshold of ${this.revenueThreshold}!`;
      console.log(message);
      this.snackBar.open(message, 'Dismiss', { duration: 5000 });
    } else if (this.revenueThreshold !== null && currentValue <= this.revenueThreshold && this.thresholdExceeded) {
      this.thresholdExceeded = false; // Reset when back below threshold
      console.log(`${this.widgetConfig.title}: Revenue back below threshold.`);
    }
  }
}
