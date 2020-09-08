import { Component, OnInit } from '@angular/core';
import { GraphHistoryItem } from '../data-types';
import { SharedService } from '../shared.service';

@Component({
  selector: 'app-graph-history',
  templateUrl: './graph-history.component.html',
  styleUrls: ['./graph-history.component.css']
})
export class GraphHistoryComponent implements OnInit {

  constructor(private _s: SharedService) { }
  graphHistory: GraphHistoryItem[];
  activeItemIdx = 0;

  ngOnInit(): void {
    this.graphHistory = this._s.graphHistory;
    this._s.addNewGraphHistoryItem.subscribe(x => {
      if (x) {
        this.activeItemIdx = this._s.graphHistory.length - 1;
      }
    });
    this._s.appConf.graphHistoryLimit.subscribe(x => {
      while (this._s.graphHistory.length > x) {
        this._s.graphHistory.splice(0, 1);
        this.activeItemIdx = this.activeItemIdx - 1;
      }
      this.graphHistory = this._s.graphHistory;
    });
  }

  load(i: number) {
    this.activeItemIdx = i;
    let g = this.graphHistory[i];
    this._s.cy.json({ elements: g.json });
    this._s.cy.fit();
  }

  delete(i: number) {
    if (i == this.activeItemIdx) {
      this.activeItemIdx = -1;
    }
    if (i < this.activeItemIdx) {
      this.activeItemIdx = this.activeItemIdx - 1;
    }
    this._s.graphHistory.splice(i, 1);
  }
}
