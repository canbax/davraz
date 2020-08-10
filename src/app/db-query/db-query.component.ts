import { Component, OnInit, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { TigerGraphApiClientService } from '../tiger-graph-api-client.service';
import { CyService } from '../cy.service';

@Component({
  selector: 'app-db-query',
  templateUrl: './db-query.component.html',
  styleUrls: ['./db-query.component.css']
})
export class DbQueryComponent implements OnInit {

  @Input() isShow = new Subject<boolean>();
  _isShow = false;
  position = { x: 500, y: 500 };
  currSize: { width: number, height: number } = { width: 375, height: 600 };
  gsql = `INTERPRET QUERY () FOR GRAPH connectivity {   
    start =   {Person.*};
    results = SELECT s FROM start:s LIMIT 10;
    PRINT results;
    }`;
  currQueryName = 'Query 1';

  constructor(private _tgApi: TigerGraphApiClientService, private _cy: CyService) { }

  ngOnInit(): void {
    this.isShow.subscribe(x => { this._isShow = x; });
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
    this._tgApi.runInterprettedQuery(this.gsql, this._cy.loadGraph);
  }

}
