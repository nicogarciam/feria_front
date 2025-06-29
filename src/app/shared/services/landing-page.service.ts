import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable()
export class LandingPageService {

  constructor(
    @Inject(DOCUMENT) private document: Document
  ) { }

  public addFix() {
    this.document.documentElement.classList.add('landing');
    this.document.body.classList.add('landing');
  }
  public removeFix() {
    this.document.documentElement.classList.remove('landing');
    this.document.body.classList.remove('landing');
  }

}
