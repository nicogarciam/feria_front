import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatChipsModule} from '@angular/material/chips';
import {MatDialogModule} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatMenuModule} from '@angular/material/menu';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatTooltipModule} from '@angular/material/tooltip';
import {FlexLayoutModule} from '@angular/flex-layout';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {SharedModule} from '../../shared/shared.module';
import {TranslateModule} from '@ngx-translate/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {PayCrudComponent} from './pay-crud.component';
import {MatSelectModule} from '@angular/material/select';
import {SharedMaterialModule} from '../../shared/shared-material.module';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {PaysRoutes} from './pay.routing';
import {PayService} from '@services/entities/pay.service';


@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        NgxDatatableModule,
        MatInputModule,
        MatIconModule,
        MatCardModule,
        MatMenuModule,
        MatButtonModule,
        MatChipsModule,
        MatListModule,
        MatTooltipModule,
        MatDialogModule,
        MatSnackBarModule,
        MatSlideToggleModule,
        TranslateModule,
        SharedModule,
        RouterModule.forChild(PaysRoutes),
        MatDatepickerModule,
        MatSelectModule,
        SharedMaterialModule,
        MatProgressSpinnerModule,
        MatAutocompleteModule,
    ],
  declarations: [PayCrudComponent],
  providers: [PayService],
  // entryComponents: [NgxTablePopupComponent]
})
export class PayModule { }
