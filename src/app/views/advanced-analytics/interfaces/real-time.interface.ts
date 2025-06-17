export interface RealTimeUpdate {
  widgetType: string; // To target specific widget types
  metric: string;     // e.g., 'currentSales', 'activeUsers'
  value: any;
  timestamp: Date;
}
