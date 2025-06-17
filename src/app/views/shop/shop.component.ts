import { Component } from '@angular/core';

@Component({
  selector: 'app-shop',
  template: '<router-outlet></router-outlet>'
})
export class ShopComponent {
  constructor() {
    console.log('ShopComponent initialized');
  }
}
