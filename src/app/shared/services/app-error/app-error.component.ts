import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {egretAnimations} from "@animations/egret-animations";

@Component({
  selector: 'app-app-error',
  templateUrl: './app-error.component.html',
  styleUrls: ['./app-error.component.css'],
  animations: egretAnimations
})
export class AppErrorComponent implements OnInit {
  title;
  msg;
  detail;
  constructor(public dialogRef: MatDialogRef<AppErrorComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit() {
    console.log(this.data);
  }

}
