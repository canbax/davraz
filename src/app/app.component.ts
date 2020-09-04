import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { TigerGraphApiClientService } from './tiger-graph-api-client.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfigDialogComponent } from './config-dialog/config-dialog.component';
import { Subject } from 'rxjs';
import { SharedService } from './shared.service';
import { readTxtFile, obj2str, debounce, OBJ_INFO_UPDATE_DELAY } from './constants';
import { SavePngDialogComponent } from './save-png-dialog/save-png-dialog.component';
import { DbQueryComponent } from './db-query/db-query.component';
import { ObjectPropertiesComponent } from './object-properties/object-properties.component';
import { TableViewComponent } from './table-view/table-view.component';

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
  isShowTableView = new Subject<boolean>();
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
  existingTypes: string[] = [];

  constructor(private _tgApi: TigerGraphApiClientService, private _s: SharedService, public dialog: MatDialog) {
    this._tgApi.simpleRequest();
  }

  ngOnInit(): void {
    this._s.init();
    this._s.elemSelectChanged.subscribe(this.showObjProps.bind(this));
    this._s.graphChanged.subscribe(x => {
      const cMames = this._s.cy.$(':visible').map(x => x.classes().join());
      const d = {};
      for (let i = 0; i < cMames.length; i++) {
        d[cMames[i]] = true;
      }
      this.existingTypes = Object.keys(d);
    });
    this._s.isLoading.subscribe(x => { this.isLoading = x; });
  }

  openDbConfigDialog() {
    const dialogRef = this.dialog.open(ConfigDialogComponent, { width: '50%' });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  loadSampleData() {
    const n1 = this._s.appConf.sampleDataNodeCount.getValue();
    const n2 = this._s.appConf.sampleDataEdgeCount.getValue();
    this._s.isLoading.next(true);
    this._tgApi.sampleData(x => { this._s.loadGraph(x); this._s.isLoading.next(false); }, n1, n2);
  }

  showDbQuery() {
    this.isShowDatabaseQuery.next(true);
  }

  clearData() {
    this._s.cy.remove(this._s.cy.$());
  }

  endPoints() {
    this._tgApi.endPoints(this._s.loadFromQuery);
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
      console.log(`Dialog result: ${result}`);
    });
  }

  deleteSelected() {
    this._s.deleteSelected();
  }

  deleteUnselected() {
    this._s.deleteUnselected();
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
    if (isSelectEvent) {
      this.objPropHeader = selected.classes().join();
      this.isShowObjectProperties.next(true);
    }
  }

  addCompound4Selected() {
    this._s.addCompound4Selected();
  }

  removeCompound4Selected() {
    this._s.removeCompound4Selected();
  }

  removeCompoundNodes() {
    this._s.removeCompoundNodes();
  }

  collapseCompoundNodes() {
    this._s.collapseCompoundNodes();
  }

  collapseCompoundEdges() {
    this._s.collapseCompoundEdges();
  }

  expandCompoundNodes() {
    this._s.expandCompoundNodes();
  }

  expandCompoundEdges() {
    this._s.expandCompoundEdges();
  }

  markovClustering() {
    this._s.markovClustering();
  }

  randomizedLayout() {
    this._s.isRandomizedLayout = true;
    this._s.performLayout()
  }

  incrementalLayout() {
    this._s.isRandomizedLayout = false;
    this._s.performLayout()
  }

  showAsTable(elems) {
    if (!elems) {
      elems = this._s.cy.$(':visible');
    }
    this.isShowTableView.next(true);

    const classes = {};
    for (let i = 0; i < elems.length; i++) {
      classes[elems[i].classes().join()] = true;
    }
    let cols = [];
    let data = [];
    const cNames = Object.keys(classes);
    if (cNames.length > 1) {
      this.tableHeader = 'Multiple Types of Objects';
      cols = ['properties'];
      for (let i = 0; i < elems.length; i++) {
        data.push({ properties: JSON.stringify(elems[i].data()) });
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
