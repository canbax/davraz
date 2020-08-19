import { Component, OnInit } from '@angular/core';
import { TigerGraphApiClientService } from './tiger-graph-api-client.service';
import { MatDialog } from '@angular/material/dialog';
import { DatabaseConfigDialogComponent } from './database-config-dialog/database-config-dialog.component';
import { Subject } from 'rxjs';
import { SharedService } from './shared.service';
import { CyService } from './cy.service';
import { SampleDataDialogComponent } from './sample-data-dialog/sample-data-dialog.component';
import { Layout } from './constants';

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

}
