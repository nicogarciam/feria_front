import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import {egretAnimations} from "@animations/egret-animations";

@Component({
  selector: 'app-app-loader',
  templateUrl: './app-loader.component.html',
  styleUrls: ['./app-loader.component.css'],
  animations: egretAnimations
})
export class AppLoaderComponent implements OnInit {
  title;
  message;
  constructor(public dialogRef: MatDialogRef<AppLoaderComponent>) {}

  ngOnInit() {
  }

}
