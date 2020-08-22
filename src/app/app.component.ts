import { Component, OnInit, ViewChild } from '@angular/core';
import { TigerGraphApiClientService } from './tiger-graph-api-client.service';
import { MatDialog } from '@angular/material/dialog';
import { DatabaseConfigDialogComponent } from './database-config-dialog/database-config-dialog.component';
import { Subject } from 'rxjs';
import { SharedService } from './shared.service';
import { CyService } from './cy.service';
import { SampleDataDialogComponent } from './sample-data-dialog/sample-data-dialog.component';
import { Layout, readTxtFile, COLLAPSED_EDGE_CLASS, COLLAPSED_NODE_CLASS } from './constants';
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
  layoutNames: string[] = Object.keys(Layout);
  @ViewChild('fileInp', { static: false }) fileInp;

  constructor(private _tgApi: TigerGraphApiClientService, private _s: SharedService, public dialog: MatDialog, private _cy: CyService) {
    this._tgApi.simpleRequest();
  }

  ngOnInit(): void {
    this._s.init();
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
    if (this.isWarn4Collapsed(elements)) {
      return;
    }
    this.str2file(JSON.stringify(elements, undefined, 4), 'visuall.json');
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

    this.str2file(JSON.stringify(o), 'visuall.txt');
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
