import { Injectable } from '@angular/core';
import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';
import chola from 'cytoscape-chola';
import avsdf from 'cytoscape-avsdf';
import cola from 'cytoscape-cola';
import euler from 'cytoscape-euler';
import spread from 'cytoscape-spread';
import dagre from 'cytoscape-dagre';
import klay from 'cytoscape-klay';
import expandCollapse from 'cytoscape-expand-collapse';
import navigator from 'cytoscape-navigator';
import viewUtilities from 'cytoscape-view-utilities';

import { Layout, LAYOUT_ANIM_DUR, expandCollapseCuePosition, EXPAND_COLLAPSE_CUE_SIZE, debounce } from './constants';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  cy: any;
  expandCollapseApi: any;
  performLayout: Function;
  currLayout: string = 'fcose';

  constructor() {
    let isGraphEmpty = () => { return this.cy.elements().not(':hidden, :transparent').length > 0 };
    this.performLayout = debounce(this.runLayout, 2 * LAYOUT_ANIM_DUR, true, isGraphEmpty);
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
    cytoscape.use(cola);
    cytoscape.use(euler);
    cytoscape.use(spread);
    cytoscape.use(dagre);
    cytoscape.use(klay);

    //register expand-collapse extension
    expandCollapse(cytoscape);
    this.bindExpandCollapseExt();
    // register navigator extension
    navigator(cytoscape);
    // register view utilities extension
    viewUtilities(cytoscape);
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

  private bindExpandCollapseExt() {
    const layout = Layout.fcose;
    layout.randomize = false;
    this.expandCollapseApi = this.cy.expandCollapse({
      layoutBy: layout,
      // recommended usage: use cose-bilkent layout with randomize: false to preserve mental map upon expand/collapse
      fisheye: false, // whether to perform fisheye view after expand/collapse you can specify a function too
      animate: true, // whether to animate on drawing changes you can specify a function too
      ready: function () { }, // callback when expand/collapse initialized
      undoable: false, // and if undoRedoExtension exists,
      randomize: false,

      cueEnabled: true, // Whether cues are enabled
      expandCollapseCuePosition: expandCollapseCuePosition,
      expandCollapseCueSize: EXPAND_COLLAPSE_CUE_SIZE, // size of expand-collapse cue
      expandCollapseCueLineSize: 8, // size of lines used for drawing plus-minus icons
      expandCueImage: undefined, // image of expand icon if undefined draw regular expand cue
      collapseCueImage: undefined, // image of collapse icon if undefined draw regular collapse cue
      expandCollapseCueSensitivity: 1, // sensitivity of expand-collapse cues
      allowNestedEdgeCollapse: false
    });
  }


}
