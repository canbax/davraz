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
import contextMenus from 'cytoscape-context-menus';

import { Layout, LAYOUT_ANIM_DUR, expandCollapseCuePosition, EXPAND_COLLAPSE_CUE_SIZE, debounce, isPrimitiveType, MAX_HIGHLIGHT_CNT, deepCopy, COLLAPSED_EDGE_CLASS, COMPOUND_CLASS, COLLAPSED_NODE_CLASS } from './constants';
import { APP_CONF } from './app-conf';
import { AppConfig } from './data-types';
import { BehaviorSubject, from, Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent } from './error-dialog/error-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  cy: any;
  expandCollapseApi: any;
  performLayout: Function;
  currLayout: string = 'fcose';
  appConf: AppConfig = {} as AppConfig;
  viewUtils: any;
  elemSelectChanged: Subject<boolean> = new Subject();

  constructor(public dialog: MatDialog) {
    let isGraphEmpty = () => { return this.cy.elements().not(':hidden, :transparent').length > 0 };
    this.performLayout = debounce(this.runLayout, 2 * LAYOUT_ANIM_DUR, true, isGraphEmpty);
    this.setAppConfig(APP_CONF, this.appConf);
  }

  init() {
    this.cy = cytoscape({
      // so we can see the ids
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(id)'
          }
        }
      ],
      container: document.getElementById('cy'),
      wheelSensitivity: 0.1,
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

    cytoscape.use(contextMenus);

    //register expand-collapse extension
    expandCollapse(cytoscape);
    this.bindExpandCollapseExt();
    // register navigator extension
    navigator(cytoscape);
    // register view utilities extension
    viewUtilities(cytoscape);

    this.bindViewUtilitiesExtension();
    this.bindContextMenus();

    this.cy.on('select unselect', (e) => { this.elemSelectChanged.next(e.type === 'select'); });
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
    const layout = deepCopy(Layout.fcose);
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

  private bindViewUtilitiesExtension() {
    let options = {
      highlightStyles: this.getHighlightStyles(),
      setVisibilityOnHide: false, // whether to set visibility on hide/show
      setDisplayOnHide: true, // whether to set display on hide/show
      zoomAnimationDuration: 1500, //default duration for zoom animation speed
      neighbor: function (node) { // return desired neighbors of tapheld node
        return false;
      },
      neighborSelectTime: 500, //ms, time to taphold to select desired neighbors,
      colorCount: MAX_HIGHLIGHT_CNT
    };
    this.viewUtils = this.cy.viewUtilities(options);
  }

  // convert primitive types in JSON to behaviour subject of that primitive type
  private setAppConfig(obj: any, userPref: any) {
    if (obj === undefined || obj === null) {
      return;
    }
    for (let k in obj) {
      let prop = obj[k];
      if (isPrimitiveType(prop)) {
        if (userPref[k]) {
          (userPref[k] as BehaviorSubject<any>).next(prop);
        } else {
          userPref[k] = new BehaviorSubject(prop);
        }
      } else {
        if (!userPref[k]) {
          if (prop instanceof Array) {
            userPref[k] = [];
          } else {
            userPref[k] = {};
          }
        }
        this.setAppConfig(obj[k], userPref[k]);
      }
    }
  }

  private getHighlightStyles(): any[] {
    let r = [];

    for (let i = 0; i < this.appConf.highlightStyles.length; i++) {
      let style = this.appConf.highlightStyles[i];
      let w = style.wid.getValue();
      let c = style.color.getValue();

      r.push({
        node: { 'border-color': c, 'border-width': w },
        edge: { 'line-color': c, 'target-arrow-color': c, 'width': 4.5 }
      });

    }
    return r;
  }

  private bindContextMenus() {
    const options = {
      // Customize event to bring up the context menu
      // Possible options https://js.cytoscape.org/#events/user-input-device-events
      evtType: 'cxttap',
      // List of initial menu items
      // A menu item must have either onClickFunction or submenu or both
      menuItems: [{
        id: 'collapseAllNodes',
        content: 'Collapse All Nodes',
        coreAsWell: true,
        onClickFunction: () => { this.collapseCompoundNodes(); }
      },
      {
        id: 'collapseAllEdges',
        content: 'Collapse All Edges',
        coreAsWell: true,
        onClickFunction: () => { this.collapseCompoundEdges(); }
      },
      {
        id: 'performLayout',
        content: 'Perform Layout',
        coreAsWell: true,
        onClickFunction: this.performLayout.bind(this)
      },
      {
        id: 'deleteSelected',
        content: 'Delete Selected',
        coreAsWell: true,
        onClickFunction: (x) => { this.deleteSelected(null) }
      },
      {
        id: 'selectObjectsOfThisType',
        content: 'Select Objects of This Type',
        selector: 'node,edge',
        onClickFunction: this.selectAllThisType.bind(this)
      },
      {
        id: 'collapseEdge',
        content: 'Collapse',
        selector: '[^collapsedEdges][^originalEnds]',
        onClickFunction: this.collapseCompoundEdges.bind(this)
      },
      {
        id: 'expandEdge',
        content: 'Expand',
        selector: 'edge.' + COLLAPSED_EDGE_CLASS,
        onClickFunction: (e) => { this.expandCompoundEdges(e.target || e.cyTarget); }
      },
      {
        id: 'removeGroup',
        content: 'Remove Group',
        selector: 'node.' + COMPOUND_CLASS,
        onClickFunction: (e) => { this.removeCompound4Selected(e.target || e.cyTarget) }
      },
      {
        id: 'deleteElement',
        content: 'Delete',
        selector: 'node,edge',
        onClickFunction: this.deleteSelected.bind(this)
      },
      ],
      // css classes that menu items will have
      menuItemClasses: ['mat-menu-item', 'ctx-menu-i'],
      // menuItemClasses: [],
      // css classes that context menu will have
      contextMenuClasses: ['mat-menu-content', 'ctx-menu-container']
      // contextMenuClasses: []
    };
    this.cy.contextMenus(options);
  }

  selectAllThisType(event) {
    const ele = event.target || event.cyTarget;
    if (!ele) {
      return;
    }
    const classes = ele.className();
    for (let c of classes) {
      this.cy.$('.' + c).select();
    }
  }

  isWarn4Collapsed(elems): boolean {
    let hasAnyCollapsed = elems.nodes('.' + COLLAPSED_NODE_CLASS).length > 0 || elems.edges('.' + COLLAPSED_EDGE_CLASS).length > 0;
    if (hasAnyCollapsed) {
      const dialogRef = this.dialog.open(ErrorDialogComponent);
      dialogRef.componentInstance.title = 'Save Error';
      dialogRef.componentInstance.content = 'Can not save since there are collapsed nodes or edges. Since they contain cyclic references, they can not be saved as JSON. Please expand all then try saving';
      return true;
    }
    return false;
  }

  addCompound4Selected() {
    const elems = this.cy.nodes(':selected');
    if (elems.length < 1) {
      return;
    }
    const parent = elems[0].parent().id();
    for (let i = 1; i < elems.length; i++) {
      if (parent !== elems[i].parent().id()) {
        return;
      }
    }
    const id = new Date().getTime();
    this.addParentNode(id, parent);
    for (let i = 0; i < elems.length; i++) {
      elems[i].move({ parent: 'c' + id });
    }
    this.performLayout(false);
  }

  removeCompound4Selected(elems = null) {
    if (!elems) {
      elems = this.cy.nodes(':selected').filter('.' + COMPOUND_CLASS);
    }
    if (elems.length < 1) {
      return;
    }
    for (let i = 0; i < elems.length; i++) {
      // expand if collapsed
      if (elems[i].hasClass(COLLAPSED_NODE_CLASS)) {
        this.expandCollapseApi.expand(elems[i], { layoutBy: null, fisheye: false, animate: false });
      }
      const grandParent = elems[i].parent().id() ?? null;
      const children = elems[i].children();
      children.move({ parent: grandParent });
      this.cy.remove(elems[i]);
    }
    this.performLayout(false);
  }

  removeCompoundNodes() {
    this.removeCompound4Selected(this.cy.nodes('.' + COMPOUND_CLASS));
  }

  collapseCompoundNodes() {
    if (this.cy.nodes(':parent').length > 0) {
      this.expandCollapseApi.collapseAll();
    }
  }

  collapseCompoundEdges(edges2collapse?: any) {
    if (!edges2collapse) {
      edges2collapse = this.cy.edges(':visible');
    }
    edges2collapse = edges2collapse.filter('[^originalEnds]'); // do not collapse meta-edges
    let sourceTargetPairs = {};
    let isCollapseBasedOnType = false;
    let edgeCollapseLimit = 2;
    for (let i = 0; i < edges2collapse.length; i++) {
      let e = edges2collapse[i];
      const s = e.data('source');
      const t = e.data('target');
      let edgeId = s + t;
      if (isCollapseBasedOnType) {
        edgeId = e.classes()[0] + s + t;
      }
      if (!sourceTargetPairs[edgeId]) {
        sourceTargetPairs[edgeId] = { cnt: 1, s: s, t: t };
      } else {
        sourceTargetPairs[edgeId]['cnt'] += 1;
      }
    }
    for (let i in sourceTargetPairs) {
      let curr = sourceTargetPairs[i];
      if (curr.cnt < edgeCollapseLimit) {
        continue;
      }
      let edges = this.cy.edges(`[source="${curr.s}"][target="${curr.t}"]`);
      this.expandCollapseApi.collapseEdges(edges);
    }
  }

  expandCompoundNodes() {
    if (this.cy.nodes('.' + COLLAPSED_NODE_CLASS).length > 0) {
      this.expandCollapseApi.expandAll();
    }
  }

  expandCompoundEdges(edges2expand?: any) {
    if (!edges2expand) {
      edges2expand = this.cy.edges('.' + COLLAPSED_EDGE_CLASS);
    }
    this.expandCollapseApi.expandEdges(edges2expand);
  }

  deleteSelected(event = null) {
    if (event) {
      const ele = event.target || event.cyTarget;
      if (ele) {
        this.cy.remove(ele);
      }
    } else {
      this.cy.remove(':selected');
    }
  }

  deleteUnselected() {
    this.cy.remove(':unselected');
  }

  hideSelected() {
    this.viewUtils.hide(this.cy.$(':selected'));
  }

  hideUnselected() {
    this.viewUtils.hide(this.cy.$(':unselected'));
  }

  showAll() {
    this.viewUtils.show(this.cy.$());
  }

  private addParentNode(idSuffix: string | number, parent = undefined) {
    const id = 'c' + idSuffix;
    const parentNode = this.createCyNode({ labels: [COMPOUND_CLASS], properties: { end_datetime: 0, begin_datetime: 0, name: name } }, id);
    this.cy.add(parentNode);
    this.cy.$('#' + id).move({ parent: parent });
  }

  private createCyNode(node, id) {
    const classes = node.labels.join(' ');
    let properties = node.properties;
    properties.id = id

    return { data: properties, classes: classes };
  }

}
