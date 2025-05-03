import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatChipsModule} from '@angular/material/chips';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatMenuModule} from '@angular/material/menu';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatRadioModule} from '@angular/material/radio';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatTabsModule} from '@angular/material/tabs';
import {FlexLayoutModule} from '@angular/flex-layout';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {ChartsModule} from 'ng2-charts';
import {FileUploadModule} from 'ng2-file-upload';
import {CustomerComponent} from './customer.component';
import {CustomerRoutes} from './customer.routing';
import {SharedPipesModule} from '../../shared/pipes/shared-pipes.module';
import {TranslateModule} from '@ngx-translate/core';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {CustomerOverviewComponent} from "./customer-overview/customer-overview.component";
import {CustomerSettingsComponent} from "./customer-settings/customer-settings.component";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {PerfectScrollbarModule} from "ngx-perfect-scrollbar";
import {MatTooltipModule} from "@angular/material/tooltip";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MatListModule,
        MatIconModule,
        MatButtonModule,
        MatCardModule,
        MatMenuModule,
        MatSlideToggleModule,
        MatGridListModule,
        MatChipsModule,
        MatCheckboxModule,
        MatRadioModule,
        MatTabsModule,
        MatInputModule,
        MatProgressBarModule,
        FlexLayoutModule,
        NgxDatatableModule,
        ChartsModule,
        FileUploadModule,
        SharedPipesModule,
        RouterModule.forChild(CustomerRoutes),
        TranslateModule,
        MatProgressSpinnerModule,
        MatDatepickerModule,
        ReactiveFormsModule,
        MatSelectModule,
        MatButtonToggleModule,
        PerfectScrollbarModule,
        MatTooltipModule,
    ],
  declarations: [CustomerComponent, CustomerOverviewComponent, CustomerSettingsComponent]
  , exports: [CustomerOverviewComponent]
})
export class CustomerModule { }
