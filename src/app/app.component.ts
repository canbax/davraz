import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { TigerGraphApiClientService } from './tiger-graph-api-client.service';
import { MatDialog } from '@angular/material/dialog';
import { DatabaseConfigDialogComponent } from './database-config-dialog/database-config-dialog.component';
import { Subject } from 'rxjs';
import { SharedService } from './shared.service';
import { CyService } from './cy.service';
import { SampleDataDialogComponent } from './sample-data-dialog/sample-data-dialog.component';
import { Layout, readTxtFile, COLLAPSED_EDGE_CLASS, COLLAPSED_NODE_CLASS, COMPOUND_CLASS, obj2str, debounce, OBJ_INFO_UPDATE_DELAY } from './constants';
import { ErrorDialogComponent } from './error-dialog/error-dialog.component';
import { SavePngDialogComponent } from './save-png-dialog/save-png-dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  cy: any = null;
  title = 'graph-imager';
  isShowDatabaseQuery = new Subject<boolean>();
  isShowObjectProperties = new Subject<boolean>();
  layoutNames: string[] = Object.keys(Layout);
  @ViewChild('fileInp', { static: false }) fileInp;
  @ViewChild('searchInp', { static: false }) searchInp;
  isShowSearchInp = false;
  searchTxt = '';

  constructor(private _tgApi: TigerGraphApiClientService, private _s: SharedService, public dialog: MatDialog, private _cy: CyService) {
    this._tgApi.simpleRequest();
  }

  ngOnInit(): void {
    this._s.init();
    const fn = debounce(this.showObjProps, OBJ_INFO_UPDATE_DELAY).bind(this)
    this._s.elemSelectChanged.subscribe(fn);
  }

  openDbConfigDialog() {
    const dialogRef = this.dialog.open(DatabaseConfigDialogComponent, { width: '50%' });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  openSampleDataDialog() {
    const dialogRef = this.dialog.open(SampleDataDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  showDbQuery() {
    this.isShowDatabaseQuery.next(true);
  }

  clearData() {
    this._s.cy.remove(this._s.cy.$());
  }

  endPoints() {
    this._tgApi.endPoints(this._cy.loadFromQuery);
  }

  runLayout(name: string) {
    this._s.currLayout = name;
    this._s.performLayout();
  }

  fileSelected() {
    readTxtFile(this.fileInp.nativeElement.files[0], (txt) => {
      const fileJSON = JSON.parse(txt);
      this._s.cy.json({ elements: fileJSON });
      this._s.cy.fit();
    });
  }

  loadGraphFromFile() {
    this.fileInp.nativeElement.value = '';
    this.fileInp.nativeElement.click();
  }

  saveGraph2File() {
    const json = this._s.cy.json();
    const elements = json.elements;
    if (!elements.nodes) {
      return;
    }
    if (this.isWarn4Collapsed(this._s.cy.$())) {
      return;
    }
    this.str2file(JSON.stringify(elements, undefined, 4), 'graph-explorer.json');
  }

  saveSelected2File() {
    const selected = this._s.cy.$(':selected');

    const selectedNodes = selected.nodes();
    const selectedEdges = selected.edges();
    if (selectedEdges.length + selectedNodes.length < 1) {
      return;
    }

    if (this.isWarn4Collapsed(selected)) {
      return;
    }

    // according to cytoscape.js format 
    const o = { nodes: [], edges: [] };
    for (const e of selectedEdges) {
      o.edges.push(e.json());
    }
    for (const n of selectedNodes) {
      o.nodes.push(n.json());
    }

    this.str2file(JSON.stringify(o), 'graph-explorer.json');
  }

  saveAsPng() {
    const dialogRef = this.dialog.open(SavePngDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
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
    const elems = this._s.cy.nodes(':selected');
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
    this._s.performLayout(false);
  }

  removeCompound4Selected(elems = null) {
    if (!elems) {
      elems = this._s.cy.nodes(':selected').filter('.' + COMPOUND_CLASS);
    }
    if (elems.length < 1) {
      return;
    }
    for (let i = 0; i < elems.length; i++) {
      // expand if collapsed
      if (elems[i].hasClass(COLLAPSED_NODE_CLASS)) {
        this._s.expandCollapseApi.expand(elems[i], { layoutBy: null, fisheye: false, animate: false });
      }
      const grandParent = elems[i].parent().id() ?? null;
      const children = elems[i].children();
      children.move({ parent: grandParent });
      this._s.cy.remove(elems[i]);
    }
    this._s.performLayout(false);
  }

  removeCompoundNodes() {
    this.removeCompound4Selected(this._s.cy.nodes('.' + COMPOUND_CLASS));
  }

  collapseCompoundNodes() {
    if (this._s.cy.nodes(':parent').length > 0) {
      this._s.expandCollapseApi.collapseAll();
    }
  }

  collapseCompoundEdges(edges2collapse?: any) {
    if (!edges2collapse) {
      edges2collapse = this._s.cy.edges(':visible');
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
      let edges = this._s.cy.edges(`[source="${curr.s}"][target="${curr.t}"]`);
      this._s.expandCollapseApi.collapseEdges(edges);
    }
  }

  expandCompoundNodes() {
    if (this._s.cy.nodes('.' + COLLAPSED_NODE_CLASS).length > 0) {
      this._s.expandCollapseApi.expandAll();
    }
  }

  expandCompoundEdges(edges2expand?: any) {
    if (!edges2expand) {
      edges2expand = this._s.cy.edges('.' + COLLAPSED_EDGE_CLASS);
    }
    this._s.expandCollapseApi.expandEdges(edges2expand);
  }

  searchAndHighlight() {
    this.isShowSearchInp = true;
    setTimeout(() => {
      this.searchInp.nativeElement.focus();
    }, 0);
  }

  @HostListener('document:keydown.enter', ['$event'])
  highlight4txt() {
    if (!this.isShowSearchInp || !this.searchTxt || this.searchTxt.length < 1) {
      return;
    }
    console.log('searching for text ', this.searchTxt);
    const elems = this._s.cy.$();
    for (let i = 0; i < elems.length; i++) {
      const s = obj2str(elems[i].data());
      if (this._s.appConf.isIgnoreCaseInText.getValue()) {
        if (s.toLowerCase().includes(this.searchTxt.toLowerCase())) {
          this._s.viewUtils.highlight(elems[i], this._s.appConf.currHighlightIdx.getValue());
        }
      } else if (s.includes(this.searchTxt)) {
        this._s.viewUtils.highlight(elems[i], this._s.appConf.currHighlightIdx.getValue());
      }
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  closeSearchInp() {
    if (this.isShowSearchInp && this.searchTxt) {
      this.isShowSearchInp = false;
    }
  }

  highlightSelected() {
    this._s.viewUtils.highlight(this._s.cy.$(':selected'), this._s.appConf.currHighlightIdx.getValue());
  }

  highlightUnselected() {
    this._s.viewUtils.highlight(this._s.cy.$(':unselected'), this._s.appConf.currHighlightIdx.getValue());
  }

  removeHighlight4Selected() {
    this._s.viewUtils.removeHighlights(this._s.cy.$(':selected'), this._s.appConf.currHighlightIdx.getValue());
  }

  removeHighlight4Unselected() {
    this._s.viewUtils.removeHighlights(this._s.cy.$(':unselected'), this._s.appConf.currHighlightIdx.getValue());
  }

  removeHighlights() {
    this._s.viewUtils.removeHighlights();
  }

  showObjProps(isSelectEvent: boolean) {
    console.log('show obj prop ', isSelectEvent);
    const selected = this._s.cy.$(':selected');
    const data = selected.data();
    this.isShowObjectProperties.next(true);

  }

  private addParentNode(idSuffix: string | number, parent = undefined) {
    const id = 'c' + idSuffix;
    const parentNode = this.createCyNode({ labels: [COMPOUND_CLASS], properties: { end_datetime: 0, begin_datetime: 0, name: name } }, id);
    this._s.cy.add(parentNode);
    this._s.cy.$('#' + id).move({ parent: parent });
  }

  private createCyNode(node, id) {
    const classes = node.labels.join(' ');
    let properties = node.properties;
    properties.id = id

    return { data: properties, classes: classes };
  }

  private str2file(str: string, fileName: string) {
    const blob = new Blob([str], { type: 'text/plain' });
    const anchor = document.createElement('a');
    anchor.download = fileName;
    anchor.href = (window.URL).createObjectURL(blob);
    anchor.dataset.downloadurl =
      ['text/plain', anchor.download, anchor.href].join(':');
    anchor.click();
  }

}
