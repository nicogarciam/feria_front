import {Directive, HostListener, OnInit} from '@angular/core';
import {Location} from "@angular/common";

@Directive({ selector: '[appBackButton]' })
export class BackButtonDirective implements OnInit {
  constructor(private location: Location ) { }
  ngOnInit() {

  }

  @HostListener("click")
  onClick(): void {
    this.location.back();
  }
}
