import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {TranslateService} from "@ngx-translate/core";

interface IMenuItem {
  type: string; // Possible values: link/dropDown/icon/separator/extLink
  name?: string; // Used as display text for item and title for separator type
  state?: string; // Router state
  icon?: string; // Material icon name
  tooltip?: string; // Tooltip text
  disabled?: boolean; // If true, item will not be appeared in sidenav.
  sub?: IChildItem[]; // Dropdown items
  badges?: IBadge[];
}
interface IChildItem {
  type?: string;
  name: string; // Display text
  state?: string; // Router state
  icon?: string;
  sub?: IChildItem[];
}

interface IBadge {
  color: string; // primary/accent/warn/hex color codes(#fff000)
  value: string; // Display text
}

@Injectable()
export class NavigationService {
  iconMenu: IMenuItem[] = [
    {
      name: 'DASHBOARD',
      type: 'link',
      tooltip: 'Dashboard',
      icon: 'dashboard',
      state: 'dashboard'
    },
    {
      name: 'products',
      type: 'link',
      tooltip: 'products',
      icon: 'inventory_2',
      state: 'products'
    },
    {
      name: 'my.store',
      type: 'link',
      tooltip: 'my.store',
      icon: 'store',
      state: 'store-config'
    },
    {
      name: 'my.store',
      type: 'icon',
      tooltip: 'my.store',
      icon: 'store',
      state: 'store-config'
    },
    {
      name: "ecommerce",
      type: "link",
      tooltip: "Shop",
      icon: "shopping_cart",
      state: "shop"
    },
    {
      name: 'sales',
      type: 'link',
      tooltip: 'sales.list',
      icon: 'list',
      state: 'sales'
    },
    {
      name: 'sales',
      type: 'icon',
      tooltip: 'sales.list',
      icon: 'list',
      state: 'sales'
    },
    {
      name: 'customers',
      type: 'link',
      tooltip: 'customers',
      icon: 'person',
      state: 'customers'
    },
    {
      name: 'providers',
      type: 'link',
      tooltip: 'providers',
      icon: 'badge',
      state: 'providers'
    },
    {
      name: 'pays',
      type: 'link',
      tooltip: 'pays',
      icon: 'account_balance_wallet',
      state: 'pays'
    }
  ]
  // Icon menu TITLE at the very top of navigation.
  // This title will appear if any icon type item is present in menu.
  iconTypeMenuTitle = this.t.instant('quick.access');
  // sets iconMenu as default;
  menuItems = new BehaviorSubject<IMenuItem[]>(this.iconMenu);
  // navigation component has subscribed to this Observable
  menuItems$ = this.menuItems.asObservable();

  constructor(private t: TranslateService) {}

  // Customizer component uses this method to change menu.
  // You can remove this method and customizer component.
  // Or you can customize this method to supply different menu for
  // different user type.
  publishNavigationChange(menuType: string) {
    this.menuItems.next(this.iconMenu);
  }

  // back(): void {
  //   this.location.back()
  // }
}
