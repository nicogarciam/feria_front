import { Component, Input, OnChanges, SimpleChanges, OnInit, OnDestroy } from '@angular/core';
import { WidgetConfig, WidgetService } from '../../services/widget.service';
import { RealTimeUpdate } from '../../interfaces/real-time.interface';
import { Subscription } from 'rxjs';

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface ActiveFilters {
  category?: string;
  [key: string]: any; // For other potential filters
}

@Component({
  template: '' // No template for the base component
})
export class BaseWidgetComponent implements OnChanges, OnInit, OnDestroy {
  @Input() widgetTitle: string;
  @Input() widgetConfig: WidgetConfig;
  @Input() dateRange: DateRange;
  @Input() activeFilters: ActiveFilters;

  private realTimeSubscription: Subscription;

  // Optional method to be implemented by derived classes
  handleRealTimeUpdate?(update: RealTimeUpdate): void;

  constructor(protected widgetService: WidgetService) { } // Made protected for potential use in derived classes

  ngOnInit(): void {
    if (this.widgetService && this.widgetService.realTimeUpdates$) {
      this.realTimeSubscription = this.widgetService.realTimeUpdates$.subscribe(update => {
        if (this.handleRealTimeUpdate && update.widgetType === this.widgetConfig?.widgetType) {
          this.handleRealTimeUpdate(update);
        }
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.dateRange) {
      this.onDateRangeChanged(changes.dateRange.currentValue);
    }
    if (changes.activeFilters) {
      this.onFiltersChanged(changes.activeFilters.currentValue);
    }
  }

  ngOnDestroy(): void {
    if (this.realTimeSubscription) {
      this.realTimeSubscription.unsubscribe();
    }
  }

  protected onDateRangeChanged(newDateRange: DateRange): void {
    // Default implementation does nothing
  }

  protected onFiltersChanged(newFilters: ActiveFilters): void {
    // Default implementation does nothing
  }
}
