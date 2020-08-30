import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { TigerGraphApiClientService } from './tiger-graph-api-client.service';
import { MatDialog } from '@angular/material/dialog';
import { DatabaseConfigDialogComponent } from './database-config-dialog/database-config-dialog.component';
import { Subject } from 'rxjs';
import { SharedService } from './shared.service';
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

  constructor(private _tgApi: TigerGraphApiClientService, private _s: SharedService, public dialog: MatDialog) {
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
    this._tgApi.endPoints(this._s.loadFromQuery);
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
