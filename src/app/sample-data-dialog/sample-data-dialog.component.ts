import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SampleDataDialogData } from '../data-types';
import { TigerGraphApiClientService } from '../tiger-graph-api-client.service';
import { CyService } from '../cy.service';

@Component({
  selector: 'app-sample-data-dialog',
  templateUrl: './sample-data-dialog.component.html',
  styleUrls: ['./sample-data-dialog.component.css']
})
export class SampleDataDialogComponent {

  nodeCnt: number = 3;
  edgeCnt: number = 2;
  constructor(
    public dialogRef: MatDialogRef<SampleDataDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SampleDataDialogData, private _tgApi: TigerGraphApiClientService, private _cy: CyService) { }

  onNoClick(): void {
    this.dialogRef.close();
  }


  sampleData() {
    this._tgApi.sampleData(x => this._cy.loadGraph(x), this.nodeCnt, this.edgeCnt);
  }

}
