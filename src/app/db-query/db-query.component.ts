import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { TigerGraphApiClientService } from '../tiger-graph-api-client.service';
import { CyService } from '../cy.service';
import { makeElemDraggable } from '../constants';

@Component({
  selector: 'app-db-query',
  templateUrl: './db-query.component.html',
  styleUrls: ['./db-query.component.css']
})
export class DbQueryComponent implements OnInit {

  @Input() isShow = new Subject<boolean>();
  @ViewChild('mainElem', { static: false }) mainElem;
  @ViewChild('moverElem', { static: false }) moverElem;
  _isShow = false;
  position = { top: '0px', left: '0px' };
  currSize: { width: number, height: number } = { width: 375, height: 600 };
  gsql = `INTERPRET QUERY () FOR GRAPH connectivity {   
    start =   {Person.*};
    results = SELECT s FROM start:s LIMIT 10;
    PRINT results;
    }`;
  currQueryName = 'Query 1';

  constructor(private _tgApi: TigerGraphApiClientService, private _cy: CyService) { }

  ngOnInit(): void {
    this.isShow.subscribe(x => {
      this._isShow = x;
      if (!x) {
        this.position.top = this.mainElem.nativeElement.style.top;
        this.position.left = this.mainElem.nativeElement.style.left;
      }
      if (x) {
        setTimeout(() => {
          makeElemDraggable(this.mainElem.nativeElement, this.moverElem.nativeElement);
        }, 0);
      }
    });
  }

  closeClicked() {
    this.isShow.next(false);
  }

  onMoveEnd(e) {
    this.position = e;
  }

  onResizeStop(e) {
    this.currSize = e.size;
  }

  runQuery() {
    this._tgApi.runInterprettedQuery(this.gsql, (x) => { this._cy.loadGraph({ nodes: x.results[0].results, edges: [] }) });
  }

}
