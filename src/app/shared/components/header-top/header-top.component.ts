import {Component, OnInit, Input, OnDestroy, Renderer2} from '@angular/core';
import {NavigationService} from '@services/navigation.service';
import {Subscription} from 'rxjs';
import {ThemeService} from '@services/theme.service';
import {TranslateService} from '@ngx-translate/core';
import {LayoutService} from '@services/layout.service';
import {JwtAuthService} from '@services/auth/jwt-auth.service';
import {IStore} from "@models/store.model";
// CartService and CartQuery seem unused in the provided code snippet for HeaderTopComponent, removed for brevity if not needed.
// import {CartService} from "@services/cart/cart.service";
// import {CartQuery} from "@services/cart/cart.query";
import { RoleService } from '@services/entities/role.service'; // Import RoleService
import { IRole } from '@models/role.model'; // Import IRole
import { Observable, of } from 'rxjs'; // Import Observable and of for allRoles$

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

    allRoles$: Observable<IRole[]> = of([]); // Initialize with empty array
    selectedImpersonationRole: string = '';

    constructor(
        private layout: LayoutService, private navService: NavigationService, public themeService: ThemeService,
        public translate: TranslateService, private renderer: Renderer2,
        public jwtAuth: JwtAuthService,
        private roleService: RoleService // Inject RoleService
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
        this.jwtAuth.store$.subscribe(value => this.selectedHotel = value);

        if (this.canImpersonate()) { // Only fetch roles if user can potentially impersonate
            this.allRoles$ = this.roleService.getRoles();
        }
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

    // --- Impersonation UI Methods ---
    canImpersonate(): boolean {
        return this.jwtAuth.canImpersonate();
    }

    isImpersonating(): boolean {
        return this.jwtAuth.isImpersonating;
    }

    onStartImpersonation(roleName: string): void {
        if (roleName) {
            this.jwtAuth.startImpersonation(roleName);
            this.selectedImpersonationRole = ''; // Reset select
        }
    }

    onStopImpersonation(): void {
        this.jwtAuth.stopImpersonation();
    }

    getImpersonatedRoleName(): string | undefined {
        if (this.isImpersonating()) {
            const currentUser = this.jwtAuth.getUser();
            // Assuming roles is string[] and impersonated user has one role
            return currentUser?.roles?.[0];
        }
        return undefined;
    }
}
