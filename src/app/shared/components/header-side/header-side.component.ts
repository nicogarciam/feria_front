import {Component, Input, OnInit, Renderer2} from '@angular/core';
import {ThemeService} from '@services/theme.service';
import {LayoutService} from '@services/layout.service';
import {TranslateService} from '@ngx-translate/core';
import {JwtAuthService} from '@services/auth/jwt-auth.service';
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {ChangeStorePopupComponent} from "@components/change-store-popup/change-store-popup.component";
import {CartService} from "@services/cart/cart.service";
import {CartQuery} from "@services/cart/cart.query";

@Component({
    selector: 'app-header-side',
    templateUrl: './header-side.template.html'
})
export class HeaderSideComponent implements OnInit {
    @Input() notificPanel;
    @Input() cartPanel;
    public availableLangs = [
        {
            name: 'ES',
            code: 'es',
            flag: 'flag-icon-es'
        },
        {
            name: 'EN',
            code: 'en',
            flag: 'flag-icon-us'
        }]
    currentLang = this.availableLangs[0];

    public egretThemes;
    public layoutConf: any;

    constructor(
        private cartService: CartService, public cartQuery: CartQuery,
        private themeService: ThemeService, private layout: LayoutService,
        public translate: TranslateService, private renderer: Renderer2,
        public jwtAuth: JwtAuthService, private dialog: MatDialog,
    ) {
    }

    ngOnInit() {
        this.egretThemes = this.themeService.egretThemes;
        this.layoutConf = this.layout.layoutConf;
        this.translate.use(this.currentLang.code);
    }

    setLang(lng) {
        this.currentLang = lng;
        this.translate.use(lng.code);
    }

    changeTheme(theme) {
        // this.themeService.changeTheme(theme);
    }

    toggleNotific() {
        this.notificPanel.toggle();
    }


    toggleCart() {
        this.cartPanel.toggle();
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

    toggleCollapse() {
        // compact --> full
        if (this.layoutConf.sidebarStyle === 'compact') {
            return this.layout.publishLayoutChange({
                sidebarStyle: 'full',
                sidebarCompactToggle: false
            }, {transitionClass: true})
        }

        // * --> compact
        this.layout.publishLayoutChange({
            sidebarStyle: 'compact',
            sidebarCompactToggle: true
        }, {transitionClass: true})

    }

    onSearch(e) {
        //   console.log(e)
    }

    openChangeStore() {
        const dialogRef: MatDialogRef<any> = this.dialog.open(ChangeStorePopupComponent, {
            width: '850px',
        })
        dialogRef.afterClosed()
            .subscribe(res => {
                if (!res) {
                    return;
                } else {

                }
            })

    }
}
