import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import {animate, style} from "@angular/animations";


interface Animation {
  origin: { x: number, y: number },
  dest: { x: number, y: number },
}

@Injectable({
  providedIn: 'root'
})
export class CartAnimationService {
  private animationSubject = new Subject<Animation>();
  animation$ = this.animationSubject.asObservable();
  private elementoSubject = new Subject<HTMLElement>();
  elemento$ = this.elementoSubject.asObservable();

  private animationInProgress = false;

  _target: { x: number, y: number };

  setElemento(elemento: HTMLElement) {
    const cartRect = elemento.getBoundingClientRect();
    const targetX = cartRect.left + (cartRect.width / 2);
    const targetY = cartRect.top + (cartRect.height / 2);
    this._target = {x: targetX, y: targetY};
  }


  animate(element: HTMLElement, origin: HTMLElement): Promise<void> {
    if (this.animationInProgress) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      this.animationInProgress = true;

      // Crear el elemento flotante para la animación
      const iconFloating = element.cloneNode(true) as HTMLElement;

      const floatingElement = this.createFloatingElement(iconFloating);

      // Obtener las posiciones absolutas respecto al documento
      const originRect = origin.getBoundingClientRect();

      // Calcular posiciones absolutas considerando el scroll
      const originPos = {
        x: originRect.left + window.scrollX,
        y: originRect.top + window.scrollY
      };

      const destPos = {
        x: this._target.x,
        y: this._target.y
      };


      // Configurar el elemento flotante con posición absoluta
      Object.assign(floatingElement.style, {
        backgroundColor: '#1976d2',
        position: 'fixed',
        zIndex: '9999',
        left: `${originRect.left}px`,
        top: `${originRect.top}px`,
        width: `${originRect.width + 10}px`,
        height: `${originRect.height + 10 }px`,
        transition: 'all 1.0s cubic-bezier(0.4, 0.2, 1, 2.3)',
        pointerEvents: 'none'
      });

      // Agregar el elemento al body
      document.body.appendChild(floatingElement);

      // Forzar un reflow
      floatingElement.offsetHeight;

      // Aplicar la animación
      requestAnimationFrame(() => {
        Object.assign(floatingElement.style, {
          transform: `translate(${destPos.x - originPos.x}px, ${destPos.y - originPos.y}px) scale(0.5)`,
          opacity: '0'
        });
      });

      // Limpiar después de la animación
      floatingElement.addEventListener('transitionend', () => {
        floatingElement.remove();
        this.animationInProgress = false;
        resolve();
      }, { once: true });
    });
  }

  private createFloatingElement(icon: HTMLElement): HTMLElement {

    // Crear el círculo exterior
    const wrapper = document.createElement('div');

    Object.assign(wrapper.style, {
      width: '45px',
      height: '45px',
      backgroundColor: '#1976d2',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    });


    // Crear el ícono (puedes usar un emoji o una imagen)
    icon.style.color = 'white';
    icon.style.fontSize = '24px';
    icon.style.display = 'flex';

    // Ensamblar los elementos
    wrapper.appendChild(icon);

    return wrapper;
  }




}
