import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { DbClientService } from './db-client.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfigDialogComponent } from './config-dialog/config-dialog.component';
import { Subject } from 'rxjs';
import { SharedService } from './shared.service';
import { readTxtFile, obj2str, COMPOUND_CLASS, Layout, COLLAPSED_EDGE_CLASS } from './constants';
import { SavePngDialogComponent } from './save-png-dialog/save-png-dialog.component';
import { DbQueryComponent } from './db-query/db-query.component';
import { ObjectPropertiesComponent } from './object-properties/object-properties.component';
import { TableViewComponent } from './table-view/table-view.component';
import { GraphHistoryComponent } from './graph-history/graph-history.component';
import { GENERAL_CY_STYLE } from './config/general-cy-style';
import { SettingsService } from './settings.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  cy: any = null;
  isShowDatabaseQuery = new Subject<boolean>();
  isShowObjectProperties = new Subject<boolean>();
  isShowTableView = new Subject<boolean>();
  isShowGraphHistory = new Subject<boolean>();
  @ViewChild('fileInp', { static: false }) fileInp;
  @ViewChild('searchInp', { static: false }) searchInp;
  isShowSearchInp = false;
  searchTxt = '';
  isLoading = false;
  objPropHeader = '';
  tableHeader = '';
  dbQueryComp = DbQueryComponent;
  objPropComp = ObjectPropertiesComponent;
  tableComp = TableViewComponent;
  graphHistoryComp = GraphHistoryComponent;
  existingTypes: string[] = [];
  layoutAlgos: string[] = [];
  private loadFileType: 'LoadGraph' | 'LoadStyle' = 'LoadGraph';

  constructor(private _dbApi: DbClientService, private _s: SharedService, private _l: SettingsService, public dialog: MatDialog) {
  }

  ngOnInit(): void {
    this._s.init();
    this._s.elemSelectChanged.subscribe(this.showObjProps.bind(this));
    this._s.graphChanged.subscribe(_ => {
      const cNames = this._s.cy.$(':visible').map(x => x.classes()[0]);
      const d = {};
      for (let i = 0; i < cNames.length; i++) {
        d[cNames[i]] = true;
      }
      this.existingTypes = Object.keys(d);
    });
    this._s.isLoading.subscribe(x => { this.isLoading = x; });
    this.layoutAlgos = Object.keys(Layout);
    const s = this._l.getRecentCyStyle();
    if (s) {
      this._s.cy.style().fromJson(GENERAL_CY_STYLE.concat(JSON.parse(s))).update();
      this._s.addFnStyles();
      this._s.bindViewUtilitiesExtension();
    }
  }

  openDbConfigDialog() {
    const dialogRef = this.dialog.open(ConfigDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  loadSampleData() {
    this.clearData();
    this._s.isLoading.next(true);
    this._dbApi.sampleData(x => { this._s.loadGraph(x); this._s.isLoading.next(false); this._s.add2GraphHistory('Load sample data'); });
  }

  showDbQuery() {
    this.isShowDatabaseQuery.next(true);
  }

  clearData() {
    this._s.cy.remove(this._s.cy.$());
  }

  fileSelected() {
    readTxtFile(this.fileInp.nativeElement.files[0], (txt) => {
      const fileJSON = JSON.parse(txt);
      if (this.loadFileType == 'LoadGraph') {
        this._s.cy.json({ elements: fileJSON });
        this._s.cy.fit();
      } else if (this.loadFileType == 'LoadStyle') {
        this._l.setRecentCyStyle(txt);
        this._s.cy.style().fromJson(GENERAL_CY_STYLE.concat(fileJSON)).update();
        this._s.addFnStyles();
        this._s.bindViewUtilitiesExtension();
      }

    });
  }

  loadGraphFromFile() {
    this.loadFileType = 'LoadGraph';
    this.fileInp.nativeElement.value = '';
    this.fileInp.nativeElement.click();
  }

  saveGraph2File() {
    const json = this._s.cy.json();
    const elements = json.elements;
    if (!elements.nodes) {
      return;
    }
    if (this._s.isWarn4Collapsed(this._s.cy.$())) {
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

    if (this._s.isWarn4Collapsed(selected)) {
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
    });
  }

  @HostListener('document:keydown.delete', ['$event'])
  deleteSelected() {
    this._s.deleteSelected();
    this._s.add2GraphHistory('selected deleted');
  }

  deleteUnselected() {
    this._s.deleteUnselected();
    this._s.add2GraphHistory('unselected deleted');
  }

  hideSelected() {
    this._s.hideSelected();
  }

  hideUnselected() {
    this._s.hideUnselected();
  }

  showAll() {
    this._s.showAll();
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
      if (this._l.appConf.isIgnoreCaseInText.getValue()) {
        if (s.toLowerCase().includes(this.searchTxt.toLowerCase())) {
          this._s.viewUtils.highlight(elems[i], this._l.appConf.currHighlightIdx.getValue());
        }
      } else if (s.includes(this.searchTxt)) {
        this._s.viewUtils.highlight(elems[i], this._l.appConf.currHighlightIdx.getValue());
      }
    }
    this._s.add2GraphHistory('highlighted based on text');
  }

  @HostListener('document:keydown.control.a', ['$event'])
  selectAllHotKeyFn(event: KeyboardEvent) {
    const activeElement = document.activeElement as any;
    if ((activeElement.tagName == 'INPUT' && activeElement.value && activeElement.value.length > 0) || activeElement.tagName == 'TEXTAREA') {
      return;
    }
    event.preventDefault();
    if (event.ctrlKey) {
      this._s.cy.$().not(':hidden, :transparent').select();
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  closeSearchInp() {
    if (this.isShowSearchInp && this.searchTxt) {
      this.isShowSearchInp = false;
    }
  }

  highlightSelected() {
    this._s.viewUtils.highlight(this._s.cy.$(':selected'), this._l.appConf.currHighlightIdx.getValue());
    this._s.add2GraphHistory('highlight selected');
  }

  highlightUnselected() {
    this._s.viewUtils.highlight(this._s.cy.$(':unselected'), this._l.appConf.currHighlightIdx.getValue());
    this._s.add2GraphHistory('highlight unselected');
  }

  removeHighlight4Selected() {
    this._s.viewUtils.removeHighlights(this._s.cy.$(':selected'), this._l.appConf.currHighlightIdx.getValue());
    this._s.add2GraphHistory('remove highlight for selected');
  }

  removeHighlight4Unselected() {
    this._s.viewUtils.removeHighlights(this._s.cy.$(':unselected'), this._l.appConf.currHighlightIdx.getValue());
    this._s.add2GraphHistory('remove highlight for unselected');
  }

  removeHighlights() {
    this._s.viewUtils.removeHighlights();
    this._s.add2GraphHistory('remove highlights');
  }

  showObjProps(isSelectEvent: boolean) {
    const selected = this._s.cy.$(':selected').not('.' + COMPOUND_CLASS);
    const collapsedEdge = selected.filter('.' + COLLAPSED_EDGE_CLASS);
    if (collapsedEdge.length > 0) {
      this.showAsTable(collapsedEdge.data('collapsedEdges'));
    }
    else if (isSelectEvent && selected && selected.length == 1) {
      this.objPropHeader = selected.classes()[0];
      this.isShowObjectProperties.next(true);
    }
  }

  addCompound4Selected() {
    this._s.addCompound4Selected();
    this._s.add2GraphHistory('add compound for selected');
  }

  removeCompound4Selected() {
    this._s.removeCompound4Selected();
    this._s.add2GraphHistory('remove compound for selected');
  }

  removeCompoundNodes() {
    this._s.removeCompoundNodes();
    this._s.add2GraphHistory('remove compound nodes');
  }

  collapseCompoundNodes() {
    this._s.collapseCompoundNodes();
    this._s.add2GraphHistory('collapse compound nodes');
  }

  collapseCompoundEdges() {
    this._s.collapseCompoundEdges();
    this._s.add2GraphHistory('collapse compound edges');
  }

  expandCompoundNodes() {
    this._s.expandCompoundNodes();
    this._s.add2GraphHistory('expand compound nodes');
  }

  expandCompoundEdges() {
    this._s.expandCompoundEdges();
    this._s.add2GraphHistory('expand compound edges');
  }

  markovClustering() {
    this._s.markovClustering();
    this._s.add2GraphHistory('apply markov clustering');
    this.incrementalLayout();
  }

  degree1Clustering() {
    this._s.degree1Clustering();
    this._s.add2GraphHistory('degree-1 clustering');
    this.incrementalLayout();
  };

  randomizedLayout() {
    this._s.isRandomizedLayout = true;
    this._s.performLayout();
  }

  incrementalLayout() {
    this._s.isRandomizedLayout = false;
    this._s.performLayout();
  }

  runLayoutAlgo(algo: string) {
    this._s.isRandomizedLayout = true;
    this._s.performLayout(algo);
  }

  showAsTable(elems) {
    if (!elems) {
      elems = this._s.cy.$(':visible');
    }
    this.isShowTableView.next(true);

    const classes = {};
    for (let i = 0; i < elems.length; i++) {
      classes[elems[i].classes()[0]] = true;
    }
    let cols = [];
    let data = [];
    const cNames = Object.keys(classes);
    if (cNames.length > 1) {
      this.tableHeader = 'Multiple Types of Objects';
      cols = ['properties'];
      for (let i = 0; i < elems.length; i++) {
        if (!elems[i].hasClass(COMPOUND_CLASS) && !elems[i].hasClass(COLLAPSED_EDGE_CLASS)) {
          const d = elems[i].data();
          delete d['originalEnds']
          data.push({ properties: JSON.stringify(d) });
        }
      }
    } else {
      this.tableHeader = cNames.join();
      const colsDict = {};
      for (let i = 0; i < elems.length; i++) {
        const d = elems[i].data();
        data.push(d);
        const keys = Object.keys(d);
        for (let j = 0; j < keys.length; j++) {
          colsDict[keys[j]] = true;
        }
      }
      cols = Object.keys(colsDict);

    }
    setTimeout(() => {
      this._s.tableData.next({ columns: cols, data: data });
    }, 0);
  }

  showSelectedAsTable() {
    this.showAsTable(this._s.cy.$(':selected').filter(':visible'));
  }

  showUnselectedAsTable() {
    this.showAsTable(this._s.cy.$(':unselected').filter(':visible'));
  }

  showTypeOfObjAsTable(t: string) {
    this.showAsTable(this._s.cy.$('.' + t).filter(':visible'));
  }

  showGraphHistory() {
    this.isShowGraphHistory.next(true);
  }

  clearCyStyle() {
    this._s.cy.style().resetToDefault().update();
    this._l.setRecentCyStyle('');
  }

  loadCyStyle() {
    this.loadFileType = 'LoadStyle';
    this.fileInp.nativeElement.value = '';
    this.fileInp.nativeElement.click();
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
