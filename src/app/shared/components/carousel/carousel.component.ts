import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {animate, style, transition, trigger, useAnimation} from '@angular/animations';
import {fadeIn, fadeOut} from '../../animations/egret-animations';

@Component({
  selector: 'carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
  animations: [
    trigger("carouselAnimation", [
      transition("void => *", [useAnimation(fadeIn, {params: { time: '1300ms' }})]),
      transition("* => void", [useAnimation(fadeOut, {params: { time: '1300ms' }})]),
    ])
  ]
})
export class CarouselComponent implements OnInit {

  @Input() slides;

  currentSlide = 0;

  constructor() {}

  ngOnInit() {
    this.preloadImages(); // for the demo
  }

  preloadImages() {
    for (const slide of this.slides) {
      console.log("carusel", this.slides);
      new Image().src = slide.src;
    }
  }


  onPreviousClick() {
    const previous = this.currentSlide - 1;
    this.currentSlide = previous < 0 ? this.slides.length - 1 : previous;
    console.log("previous clicked, new current slide is: ", this.currentSlide);
  }

  onNextClick() {
    const next = this.currentSlide + 1;
    this.currentSlide = next === this.slides.length ? 0 : next;
    console.log("next clicked, new current slide is: ", this.currentSlide);
  }
}
