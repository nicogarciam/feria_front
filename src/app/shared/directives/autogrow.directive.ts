import {Directive, ElementRef, HostListener} from '@angular/core'

// ElementRef => Gives access to host element
// Renderer => Gives access to modify that element

@Directive({
    selector: '[appAutoGrow]'
})
export class AutoGrowDirective {
    constructor(private el: ElementRef) {
    }


    @HostListener('focus') onFocus() {
        this.el.nativeElement.style.width = "500px";
        // this.el.nativeElement.setElementStyle(this.el.nativeElement, 'Width', '500px');
    }

    @HostListener('blur') onBlur() {
        this.el.nativeElement.style.width = "120px";
        // this.renderer.setElementStyle(this.el.nativeElement, 'Width', '120px');
    }

}
