import {AfterViewInit, Component, ElementRef, EventEmitter, LOCALE_ID, OnInit, Output, ViewChild} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';

import {RoutePartsService} from "@services/route-parts.service";
import {TranslateService} from '@ngx-translate/core';
// import { ThemeService } from './shared/services/theme.service';
import {filter} from 'rxjs/operators';
// import { LayoutService } from './shared/services/layout.service';
import {registerLocaleData} from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import localeEs from '@angular/common/locales/es-AR';
import localeEn from '@angular/common/locales/en';
import {MAT_DATE_LOCALE} from "@angular/material/core";
import {CartAnimationService} from "@services/cart/cart-animation.service";

registerLocaleData(localeFr, 'fr');
registerLocaleData(localeEs, 'es');
registerLocaleData(localeEn, 'en');

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    providers: [
        {provide: LOCALE_ID, useValue: "es"},
        {provide: MAT_DATE_LOCALE, useValue: 'es'},
    ]
})
export class AppComponent implements OnInit, AfterViewInit {
    appTitle = 'FeriAr';
    pageTitle = '';

    selectedLanguage = 'es';

    activeAnimations: any[] = [];

    @Output() elementReady = new EventEmitter<HTMLElement>();


    constructor(
        public title: Title, private router: Router,
        private activeRoute: ActivatedRoute, private routePartsService: RoutePartsService,
        private translateService: TranslateService

    ) {
    }

    ngOnInit() {

        this.changePageTitle();
        this.translateService.setDefaultLang(this.selectedLanguage);
        this.translateService.use(this.selectedLanguage);
    }

    ngAfterViewInit() {
    }

    changePageTitle() {
        this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((routeChange) => {
            const routeParts = this.routePartsService.generateRouteParts(this.activeRoute.snapshot);
            if (!routeParts.length) {
                return this.title.setTitle(this.appTitle);
            }
            // Extract title from parts;
            this.pageTitle = routeParts
                .reverse()
                .map((part) => part.title)
                .reduce((partA, partI) => {
                    return `${partA} > ${partI}`
                });
            this.pageTitle += ` | ${this.appTitle}`;
            this.title.setTitle(this.pageTitle);
        });
    }

}
