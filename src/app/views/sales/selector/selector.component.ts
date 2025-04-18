import {Component, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {TranslateService} from '@ngx-translate/core';
import {egretAnimations} from "@animations/egret-animations";
import {SelectContainerComponent} from "ngx-drag-to-select";

@Component({
    selector: 'app-selector',
    templateUrl: './selector.component.html',
    styleUrls: ['./selector.component.css'],
    animations: egretAnimations
})
export class SelectorComponent implements OnInit {

    @ViewChild(SelectContainerComponent) dtsContainer!: SelectContainerComponent;

    public selectedDocuments: any[] = [];


    constructor(private router: ActivatedRoute,
                private snack: MatSnackBar, private translate: TranslateService) {
    }

    ngOnInit(): void {
    }

    someMethod($event: any) {
        console.log($event);
    }
}
