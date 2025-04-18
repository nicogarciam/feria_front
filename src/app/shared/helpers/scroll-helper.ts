import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScrollHelper {

  constructor() {

  }

  determineScroll(htmlIdElementToScroll: string): void {

    const horizontalElement = document.getElementById(htmlIdElementToScroll)!;

    window.addEventListener("wheel", function (element: WheelEvent) {
      if (element.deltaY > 0) {
        horizontalElement.scrollLeft += 100;
      } else {
        horizontalElement.scrollLeft -= 100;
      }
    })
  }

  determineHorizontalScrollOnly(htmlIdElementToScroll: string, htmlIdElementListen?: string): void {

    const horizontalElement = document.getElementById(htmlIdElementToScroll)!;
    const obj = htmlIdElementListen ? document.getElementById(htmlIdElementToScroll) : window;

    obj.addEventListener("wheel", function (event: WheelEvent) {
      event.preventDefault();
      if (event.deltaY > 0) {
        horizontalElement.scrollLeft += 100;
      } else {
        horizontalElement.scrollLeft -= 100;
      }

    })
  }


  determineFollowVerticalScroll(htmlIdElementToScroll: string, htmlIdElementListen?: string): void {

    const horizontalElement = document.getElementById(htmlIdElementToScroll)!;
    const obj = htmlIdElementListen ? document.getElementById(htmlIdElementToScroll) : window;

    obj.addEventListener("wheel", function (event: WheelEvent) {
      if (event.deltaX > 0) {
        horizontalElement.scrollTop += 100;
      } else {
        horizontalElement.scrollTop -= 100;
      }
    })
  }


}


export function preventScroll(e) {

  ['mousedown',
    'wheel',
    'DOMMouseScroll',
    'mousewheel',
    'touchmove',
  ].forEach(event => {
    e.target.addEventListener(
        event,
        preventDefault);
  });

  return false;
}

export function enableScroll(e: Event) {
  ['mousedown',
    'wheel',
    'DOMMouseScroll',
    'mousewheel',
    'touchmove',
  ].forEach(event => {
    e.target.removeEventListener(
        event,
        preventDefault);
  });
}

function  preventDefault(e: Event): void {
  e.preventDefault();
  e.stopPropagation();
}
