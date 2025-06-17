import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SharedPipesModule } from 'app/shared/pipes/shared-pipes.module';

import { DashboardRoutes } from './dashboard.routing';
import { DefaultDashboardComponent } from './default-dashboard/default-dashboard.component';
import {TranslateModule} from '@ngx-translate/core';
import {MatInputModule} from '@angular/material/input';
import { AdvancedAnalyticsModule } from '../advanced-analytics/advanced-analytics-module';

@NgModule({
    imports: [
        CommonModule,
        MatIconModule,
        MatCardModule,
        MatMenuModule,
        MatProgressBarModule,
        MatExpansionModule,
        MatButtonModule,
        MatChipsModule,
        MatListModule,
        MatTabsModule,
        MatTableModule,
        MatGridListModule,
        FlexLayoutModule,
        NgxDatatableModule,
        SharedPipesModule,
        RouterModule.forChild(DashboardRoutes),
        TranslateModule,
        MatInputModule,
        AdvancedAnalyticsModule
    ],
  declarations: [DefaultDashboardComponent],
  exports: []
})
export class DashboardModule {

}
