import {Component, OnInit, Input, OnDestroy, Renderer2} from '@angular/core';
import {NavigationService} from '@services/navigation.service';
import {Subscription} from 'rxjs';
import {ThemeService} from '@services/theme.service';
import {TranslateService} from '@ngx-translate/core';
import {LayoutService} from '@services/layout.service';
import {JwtAuthService} from '@services/auth/jwt-auth.service';
import {IStore} from "@models/store.model";
import {CartService} from "@services/cart/cart.service";
import {CartQuery} from "@services/cart/cart.query";

@Component({
    selector: 'app-header-top',
    templateUrl: './header-top.component.html'
})
export class HeaderTopComponent implements OnInit, OnDestroy {
    layoutConf: any;
    menuItems: any;
    menuItemSub: Subscription;
    selectedHotel: IStore;
    egretThemes: any[] = [];
    currentLang = 'es';
    availableLangs = [{
        name: 'English',
        code: 'en',
    }, {
        name: 'Spanish',
        code: 'es',
    }, {
        name: 'Português',
        code: 'pr',
    }]
    @Input() notificPanel;

    constructor(
        private layout: LayoutService, private navService: NavigationService, public themeService: ThemeService,
        public translate: TranslateService, private renderer: Renderer2,
        public jwtAuth: JwtAuthService
    ) {
    }

    ngOnInit() {
        this.layoutConf = this.layout.layoutConf;
        this.egretThemes = this.themeService.egretThemes;
        this.menuItemSub = this.navService.menuItems$
            .subscribe(res => {
                res = res.filter(item => item.type !== 'icon' && item.type !== 'separator');
                const limit = 4
                const mainItems: any[] = res.slice(0, limit)
                if (res.length <= limit) {
                    return this.menuItems = mainItems
                }
                const subItems: any[] = res.slice(limit, res.length - 1)
                mainItems.push({
                    name: 'More',
                    type: 'dropDown',
                    tooltip: 'More',
                    icon: 'more_horiz',
                    sub: subItems
                })
                this.menuItems = mainItems
            });
        this.jwtAuth.store$.subscribe(value => this.selectedHotel = value)
    }

    ngOnDestroy() {
        this.menuItemSub.unsubscribe()
    }

    setLang() {
        this.translate.use(this.currentLang)
    }

    changeTheme(theme) {
        this.layout.publishLayoutChange({matTheme: theme.name})
    }

    toggleNotific() {
        this.notificPanel.toggle();
    }

    toggleSidenav() {
        if (this.layoutConf.sidebarStyle === 'closed') {
            return this.layout.publishLayoutChange({
                sidebarStyle: 'full'
            })
        }
        this.layout.publishLayoutChange({
            sidebarStyle: 'closed'
        })
    }
}
