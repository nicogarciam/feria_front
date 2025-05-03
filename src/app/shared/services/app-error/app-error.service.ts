import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { AppErrorComponent } from './app-error.component';
import {TranslateService} from '@ngx-translate/core';

interface ConfirmData {
  title?: string,
  msg?: string,
  detail?: string;
  error?: any;
}

@Injectable()
export class AppErrorService {
  dialogRef: MatDialogRef<AppErrorComponent>;

  errors = {
    0: 'server.error.try.later',
    403: 'unautorized',
    500: 'server.error.try.later',
    505: 'server.error.try.later',
  }
  constructor(private dialog: MatDialog, private t: TranslateService) { }


// {
//   error:
//       {
//         message: "Booking State not found",
//         success: false,
//       },
//   message:"Http failure response for http://localhost/alojar_api/public/api/booking_states/historic?booking_id=25: 404 Not Found",
//   name: "HttpErrorResponse",
//   ok: false,
//   status: 404,
//   statusText:"Not Found"
//
// }





  public error(error: any, data: ConfirmData = {}): Observable<boolean> {
    if (error.status === 404) {
      return null;
    }
    // console.log(error);
    data.title = data.title || 'Error ' + error.status ;


    data.msg = data.msg || error.error.message ? this.t.instant(error.error?.message) : null || this.t.instant(this.errors[error.status]);
    data.error = error.error;
    data.detail = error.message;
    this.dialogRef = this.dialog.open(AppErrorComponent, {
      width: '380px',
      data: data
    });
    return this.dialogRef.afterClosed();
  }

}
