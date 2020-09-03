import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { TigerGraphApiClientService } from '../tiger-graph-api-client.service';
import { makeElemDraggable } from '../constants';
import { SharedService } from '../shared.service';
import { DbQuery } from '../data-types';
import { SettingsService } from '../settings.service';

@Component({
  selector: 'app-db-query',
  templateUrl: './db-query.component.html',
  styleUrls: ['./db-query.component.css']
})
export class DbQueryComponent implements OnInit {

  gsql = `INTERPRET QUERY () FOR GRAPH connectivity {   
    start =   {Person.*};
    results = SELECT s FROM start:s LIMIT 10;
    PRINT results;
    }`;
  currQueryName = 'Query 1';
  queries: DbQuery[] = [];

  constructor(private _tgApi: TigerGraphApiClientService, private _s: SharedService, private _settings: SettingsService) { }

  ngOnInit(): void {
    this.queries = this._settings.getAllDbQueries();
  }

  runQuery() {
    this._tgApi.runInterprettedQuery(this.gsql, (x) => { this._s.loadGraph({ nodes: x.results[0].results, edges: [] }) });
  }

  saveQuery() {
    this._settings.upsertDbQuery(this.gsql, this.currQueryName);
    this.queries = this._settings.getAllDbQueries();
  }

  removeQuery(q: DbQuery) {
    this._settings.deleteDbQuery(q.name);
    this.queries = this._settings.getAllDbQueries();
  }

  loadQuery(q: DbQuery) {
    this.gsql = q.query;
    this.currQueryName = q.name;
  }

}
