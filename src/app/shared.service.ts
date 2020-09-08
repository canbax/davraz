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

import { Layout, LAYOUT_ANIM_DUR, expandCollapseCuePosition, EXPAND_COLLAPSE_CUE_SIZE, debounce, MAX_HIGHLIGHT_CNT, deepCopy, COLLAPSED_EDGE_CLASS, COMPOUND_CLASS, COLLAPSED_NODE_CLASS, OBJ_INFO_UPDATE_DELAY, isPrimitiveType } from './constants';
import { AppConfig, GraphResponse, NodeResponse, InterprettedQueryResult, TableData, isNodeResponse, isEdgeResponse, EdgeResponse } from './data-types';
import { Subject, BehaviorSubject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent } from './error-dialog/error-dialog.component';
import { TigerGraphApiClientService } from './tiger-graph-api-client.service';
import { SettingsService } from './settings.service';
import { CY_STYLE } from './config/cy-style';
import { GENERAL_CY_STYLE } from './config/general-cy-style';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  cy: any;
  expandCollapseApi: any;
  performLayout: Function;
  isRandomizedLayout: boolean = true;
  appConf: AppConfig;
  viewUtils: any;
  isLoading: BehaviorSubject<boolean> = new BehaviorSubject(false);
  elemSelectChanged: Subject<boolean> = new Subject();
  graphChanged: Subject<boolean> = new Subject();
  elemHoverChanged: Subject<any> = new Subject();
  tableData: Subject<TableData> = new Subject();
  elems2highlight = null;

  constructor(public dialog: MatDialog, private _tgApi: TigerGraphApiClientService, private _settings: SettingsService) {
    let isGraphEmpty = () => { return this.cy.elements().not(':hidden, :transparent').length > 0 };
    this.performLayout = debounce(this.runLayout, 2 * LAYOUT_ANIM_DUR, true, isGraphEmpty);
    this.appConf = this._settings.getAppConfig();
  }

  init() {
    this.cy = cytoscape({
      // so we can see the ids
      style: CY_STYLE.concat(GENERAL_CY_STYLE),
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

    const fn = debounce((e) => { this.elemSelectChanged.next(e.type === 'select'); }, OBJ_INFO_UPDATE_DELAY);
    this.cy.on('select unselect', fn);
    const fn2 = debounce(() => { this.graphChanged.next(true) }, OBJ_INFO_UPDATE_DELAY);
    this.cy.on('add remove', fn2);
    const fn3 = debounce((e) => { this.elemHoverChanged.next(e) }, OBJ_INFO_UPDATE_DELAY);
    this.cy.on('mouseover mouseout', 'node, edge', fn3);

    this.bindComponentSelector();
  }

  private runLayout(algoName: string = null): void {
    const elems4layout = this.cy.elements().not(':hidden, :transparent');
    if (elems4layout.length < 1) {
      return;
    }
    if (!algoName) {
      algoName = this.appConf.currLayout.getValue();
    }
    const l = Layout[algoName];
    if (!l) {
      console.log('undefined layout')
    }

    if (l.randomize !== undefined) {
      l.randomize = this.isRandomizedLayout;
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

  private bindComponentSelector() {
    let isSelectionLocked: boolean = false;

    this.cy.on('taphold', 'node', (e) => {
      if (!e.originalEvent.shiftKey) {
        return;
      }
      e.target.component().select();
      // it selects current node again to prevent that, disable selection until next tap event
      this.cy.autounselectify(true);
      isSelectionLocked = true;
    });

    this.cy.on('free', 'node', () => {
      if (!isSelectionLocked) {
        return;
      }
      // wait to prevent unselect clicked node, after tapend 
      setTimeout(() => {
        this.cy.autounselectify(false);
        isSelectionLocked = false;
      }, 100);
    });
  }

  getHighlightStyles(): any[] {
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
        content: 'Incremental Layout',
        coreAsWell: true,
        onClickFunction: () => { this.isRandomizedLayout = false; this.performLayout(); }
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
        selector: 'edge[^collapsedEdges][^originalEnds]',
        onClickFunction: (e) => {
          const ele = e.target || e.cyTarget;
          if (!ele) {
            return;
          }
          this.collapseCompoundEdges(ele.parallelEdges());
        }
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
      {
        id: 'getneighbors',
        content: 'Get Neighbors',
        selector: 'node',
        onClickFunction: this.getNeighbors.bind(this)
      }
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

  getNeighbors(e) {
    const ele = e.target || e.cyTarget;
    if (!ele) {
      return;
    }
    this.isLoading.next(true);
    this._tgApi.getNeighborsOfNode(this.loadGraph.bind(this), ele);
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
    } else {
      edges2collapse = edges2collapse.filter('[^originalEnds]'); // do not collapse meta-edges
      this.expandCollapseApi.collapseEdges(edges2collapse);
      return;
    }
    edges2collapse = edges2collapse.filter('[^originalEnds]'); // do not collapse meta-edges
    let sourceTargetPairs = {};
    // let isCollapseBasedOnType = false;
    let edgeCollapseLimit = 1;
    for (let i = 0; i < edges2collapse.length; i++) {
      let e = edges2collapse[i];
      const s = e.data('source');
      const t = e.data('target');
      let edgeId = s + t;
      // if (isCollapseBasedOnType) {
      //   edgeId = e.classes()[0] + s + t;
      // }
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

  loadGraph(resp: GraphResponse) {
    if (!resp) {
      console.log('error in graph response: ', resp);
      return;
    }
    const currHiglightIdx = this.appConf.currHighlightIdx.getValue();
    this.viewUtils.removeHighlights();
    this.isRandomizedLayout = this.cy.$().length < 1;
    const node_ids = {};
    // add nodes
    for (const node of resp.nodes) {
      if (!node) {
        continue;
      }
      node.attributes.id = 'n_' + node.v_id;
      if (this.cy.$id(node.attributes.id).length > 0) {
        continue;
      }
      node_ids[node.v_id] = true;
      this.cy.add({ data: node.attributes, classes: node.v_type });
      if (!this.isRandomizedLayout) {
        this.viewUtils.highlight(this.cy.$id(node.attributes.id), currHiglightIdx);
      }
    }

    for (const edge of resp.edges) {
      const fromId = 'n_' + edge.from_id;
      const toId = 'n_' + edge.to_id;
      edge.attributes.source = fromId;
      edge.attributes.target = toId;
      edge.attributes.id = 'e_' + fromId + '-' + toId;

      if (this.cy.$id(edge.attributes.id).length > 0) {
        continue;
      }
      if (this.cy.$id(fromId).length < 1 || this.cy.$id(toId).length < 1) {
        continue;
      }
      this.cy.add({ data: edge.attributes, classes: edge.e_type });
      if (!this.isRandomizedLayout) {
        this.viewUtils.highlight(this.cy.$id(edge.attributes.id), currHiglightIdx);
      }
    }

    this.isLoading.next(false);
    this.performLayout();
  }

  loadGraph4InstalledQuery(x) {
    let nodes: NodeResponse[] = [];
    this.findAllNodes(x, nodes);
    let edges: EdgeResponse[] = [];
    this.findAllEdges(x, edges);
    this.loadGraph({ edges: edges, nodes: nodes });
  }

  loadFromQuery(resp: InterprettedQueryResult) {
    console.log('from query: ', resp);
  }

  markovClustering() {
    let clusters = this.cy.$(':visible').markovClustering({ attributes: [() => { return 1; }] });
    for (let i = 0; i < clusters.length; i++) {
      this.addParentNode(i);
      clusters[i].move({ parent: 'c' + i });
    }
  }

  highlightElem(id: string) {
    const e = this.cy.$('#' + id);
    this.elems2highlight = null;
    if (e.isEdge()) {
      this.elems2highlight = this.elems2highlight.connectedNodes().union(e);
    } else {
      this.elems2highlight = e.neighborhood().union(e);
    }
    this.endlessOpacityAnim();
  }

  private endlessOpacityAnim() {
    if (!this.elems2highlight) {
      return;
    }
    else {
      const a = this.elems2highlight.animation({ style: { opacity: 0.5 }, duration: 500 });
      a.play() // start
        .promise('completed').then(function () { // on next completed
          a.reverse() // switch animation direction
            .rewind() // optional but makes intent clear
            .play(); // start again
        });
      setTimeout(() => { this.endlessOpacityAnim() }, 1000);
    }
  }

  private findAllNodes(x, r: NodeResponse[]) {
    if (x === null || x === undefined || isPrimitiveType(x)) {
      return;
    }
    for (let k in x) {
      if (isNodeResponse(x[k])) {
        r.push(x[k]);
      } else {
        this.findAllNodes(x[k], r);
      }
    }
  }

  private findAllEdges(x, r: EdgeResponse[]) {
    if (x === null || x === undefined || isPrimitiveType(x)) {
      return;
    }
    for (let k in x) {
      if (isEdgeResponse(x[k])) {
        r.push(x[k]);
      } else {
        this.findAllEdges(x[k], r);
      }
    }
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
