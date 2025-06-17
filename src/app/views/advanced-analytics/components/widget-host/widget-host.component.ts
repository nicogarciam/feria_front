import { Component, Input, OnInit, ViewChild, ViewContainerRef, ComponentFactoryResolver, OnDestroy, SimpleChanges, OnChanges } from '@angular/core';
import { WidgetConfig, WidgetService } from '../../services/widget.service';
import { SalesRevenueWidgetComponent } from '../../widgets/sales-revenue-widget/sales-revenue-widget.component';
import { CustomerChurnWidgetComponent } from '../../widgets/customer-churn-widget/customer-churn-widget.component';
import { SalesByMonthWidgetComponent } from '../../widgets/sales-by-month-widget/sales-by-month-widget.component';
import { BaseWidgetComponent, DateRange, ActiveFilters } from '../base-widget/base-widget.component';

@Component({
  selector: 'app-widget-host',
  template: `<ng-template #widgetContainer></ng-template>`
})
export class WidgetHostComponent implements OnInit, OnDestroy, OnChanges {
  @Input() widgetConfig: WidgetConfig;
  @Input() dateRange: DateRange;
  @Input() activeFilters: ActiveFilters;
  @ViewChild('widgetContainer', { read: ViewContainerRef, static: true }) widgetContainer: ViewContainerRef;

  private componentRef: any; // Could be ComponentRef<BaseWidgetComponent>

  // Map widget types to their corresponding components
  private widgetTypeToComponentMap = {
    'sales-revenue': SalesRevenueWidgetComponent,
    'customer-churn': CustomerChurnWidgetComponent,
    'sales-by-month': SalesByMonthWidgetComponent // Add new widget to map
    // Add other widget types here
  };

  constructor(
    private resolver: ComponentFactoryResolver,
    private widgetService: WidgetService
  ) { }

  ngOnInit(): void {
    this.loadWidget();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.componentRef) return;

    const widgetInstance = <BaseWidgetComponent>this.componentRef.instance;
    let propChanges: SimpleChanges = {};

    if (changes.dateRange && changes.dateRange.currentValue) {
      widgetInstance.dateRange = changes.dateRange.currentValue;
      propChanges.dateRange = changes.dateRange;
    }

    if (changes.activeFilters && changes.activeFilters.currentValue) {
      widgetInstance.activeFilters = changes.activeFilters.currentValue;
      propChanges.activeFilters = changes.activeFilters;
    }

    // Manually trigger ngOnChanges in the dynamic component if there were changes
    if (Object.keys(propChanges).length > 0 && widgetInstance.ngOnChanges) {
      widgetInstance.ngOnChanges(propChanges);
    }
  }

  loadWidget(): void {
    if (!this.widgetConfig || !this.widgetConfig.widgetType) {
      console.error('Widget configuration or type is missing.');
      return;
    }

    const componentToLoad = this.widgetTypeToComponentMap[this.widgetConfig.widgetType];
    if (!componentToLoad) {
      console.error(`Unknown widget type: ${this.widgetConfig.widgetType}`);
      return;
    }

    const factory = this.resolver.resolveComponentFactory(componentToLoad);
    this.widgetContainer.clear();
    this.componentRef = this.widgetContainer.createComponent(factory);

    // Pass config and initial dateRange and activeFilters to the widget instance
    const widgetInstance = <BaseWidgetComponent>this.componentRef.instance;
    widgetInstance.widgetConfig = this.widgetConfig;
    widgetInstance.widgetTitle = this.widgetConfig.title;
    widgetInstance.dateRange = this.dateRange;
    widgetInstance.activeFilters = this.activeFilters; // Pass initial activeFilters
  }

  ngOnDestroy(): void {
    if (this.componentRef) {
      this.componentRef.destroy();
    }
  }
}
