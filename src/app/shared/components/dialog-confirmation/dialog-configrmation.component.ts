import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
    title: string;
    message: string;
    note: string;
    withNote: boolean;
}

@Component({
    selector: 'app-dialog-confirmation',
    templateUrl: './dialog-confirmation.component.html',
    styleUrls: ['./dialog-confirmation.component.css']
})
export class DialogConfirmationComponent implements OnInit {


    constructor(
        public dialogoRef: MatDialogRef<DialogConfirmationComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

    close(): void {
        this.dialogoRef.close({resp: false});
    }
    confirm(): void {
        this.dialogoRef.close({resp: true, note: this.data.note});
    }

    ngOnInit() {
    }

}
