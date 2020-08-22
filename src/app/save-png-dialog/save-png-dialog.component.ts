import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { SharedService } from '../shared.service';

@Component({
  selector: 'app-save-png-dialog',
  templateUrl: './save-png-dialog.component.html',
  styleUrls: ['./save-png-dialog.component.css']
})
export class SavePngDialogComponent implements OnInit {

  currOption = 0;
  constructor(private _s: SharedService, public dialogRef: MatDialogRef<SavePngDialogComponent>,) { }

  ngOnInit(): void {
  }

  onOkClicked() {
    const options = { bg: 'white', scale: 3, full: this.currOption == 0 };
    const base64png: string = this._s.cy.png(options);
    // just giving base64 string as link gives error on big images
    fetch(base64png)
      .then(res => res.blob())
      .then(x => {
        const anchor = document.createElement('a');
        anchor.download = 'graph-explorer.png';
        anchor.href = (window.URL).createObjectURL(x);
        anchor.click();
      })

    this.dialogRef.close();
  }

}
