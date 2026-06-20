import { Directive, HostListener } from '@angular/core';

declare const require: any;
const screenfull = require('screenfull');

@Directive({
  selector: '[appToggleFullscreen]'
})
export class ToggleFullscreenDirective {

  @HostListener('click') onClick() {
    if (screenfull.enabled) {
      screenfull.toggle();
    }
  }
}
