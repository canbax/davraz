import { Injectable } from '@angular/core';
import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';
import chola from 'cytoscape-chola';
import avsdf from 'cytoscape-avsdf';
import { Layout, LAYOUT_ANIM_DUR } from './constants';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  cy: any;
  performLayout: Function;
  currLayout: string = 'fcose';

  constructor() {
    let isGraphEmpty = () => { return this.cy.elements().not(':hidden, :transparent').length > 0 };
    this.performLayout = this.debounce(this.runLayout, 2 * LAYOUT_ANIM_DUR, true, isGraphEmpty);
  }

  init() {
    this.cy = cytoscape({
      elements: {},

      // so we can see the ids
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(id)'
          }
        }
      ],
      container: document.getElementById('cy')
    });
    window['cy'] = this.cy;

    cytoscape.use(fcose);
    cytoscape.use(chola);
    cytoscape.use(avsdf);
  }

  private runLayout(): void {
    const elems4layout = this.cy.elements().not(':hidden, :transparent');
    if (elems4layout.length < 1) {
      return;
    }
    const l = Layout[this.currLayout];
    if (!l) {
      console.log('undefined layout')
    }
    elems4layout.layout(l).run();
  }

  /** https://davidwalsh.name/javascript-debounce-function
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds. If `immediate` is passed, trigger the function on the
 * leading edge, instead of the trailing.
 * @param  {} func
 * @param  {number} wait
 * @param  {boolean=false} immediate
 * @param  {} preConditionFn=null if function returns false, ignore this call
 */
  private debounce(func, wait: number, immediate: boolean = false, preConditionFn = null) {
    let timeout;
    return function () {
      if (preConditionFn && !preConditionFn()) {
        return;
      }
      const context = this, args = arguments;
      const later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }
}
