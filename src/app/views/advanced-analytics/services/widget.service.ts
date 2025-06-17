import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { RealTimeUpdate } from '../interfaces/real-time.interface';

export interface WidgetConfig {
  widgetType: string;
  title: string;
  // Add other common configuration properties here
}

@Injectable({
  providedIn: 'root'
})
export class WidgetService {
  private availableWidgets: string[] = ['sales-revenue', 'customer-churn', 'sales-by-month'];
  public realTimeUpdates$ = new Subject<RealTimeUpdate>();

  constructor() {
    this.simulateSalesUpdate(); // Start simulation
  }

  getAvailableWidgets(): string[] {
    return this.availableWidgets;
  }

  simulateSalesUpdate(): void {
    let iteration = 0;
    setInterval(() => {
      iteration++;
      let newValue;
      // Alternate between values likely above and below a common threshold like 7000-8000
      if (iteration % 3 === 0) {
        newValue = Math.floor(Math.random() * 2000) + 8500; // Higher values: 8500 - 10499
      } else if (iteration % 3 === 1) {
        newValue = Math.floor(Math.random() * 2000) + 6000; // Mid values: 6000 - 7999
      } else {
        newValue = Math.floor(Math.random() * 2000) + 3000; // Lower values: 3000 - 4999
      }

      const update: RealTimeUpdate = {
        widgetType: 'sales-revenue',
        metric: 'totalRevenue',
        value: newValue,
        timestamp: new Date()
      };
      this.realTimeUpdates$.next(update);
      console.log('Simulated sales update:', newValue);
    }, 3000); // Push an update every 3 seconds for faster testing
  }

  // Later, this service can fetch widget configurations from a backend
  // or allow users to save their customized widget layouts.
}
