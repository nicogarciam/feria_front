import {Directive, ElementRef, HostListener} from '@angular/core';

@Directive({
    selector: '[appSelectOnFocus]'
})

export class SelectOnFocusDirective {

    constructor(private el: ElementRef) {
    }

    @HostListener('focus', null) onFocus() {
        console.log('appSelectOnFocus', this.el);
        this.el.nativeElement.select();
    }

    @HostListener('mouseenter') onMouseEnter() {
        this.highlight('yellow');
    }

    private highlight(color: string) {
        this.el.nativeElement.style.backgroundColor = color;
    }
}
