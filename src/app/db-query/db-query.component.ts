import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { TigerGraphApiClientService } from '../tiger-graph-api-client.service';
import { makeElemDraggable } from '../constants';
import { SharedService } from '../shared.service';
import { DbQuery, InstalledDbQuery } from '../data-types';
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
  installedQueries: InstalledDbQuery[] = [];
  currInstalledQuery: InstalledDbQuery;
  rawInstalledQueryResponse = '';

  constructor(private _tgApi: TigerGraphApiClientService, private _s: SharedService, private _settings: SettingsService) { }

  ngOnInit(): void {
    this.queries = this._settings.getAllDbQueries();
    this._tgApi.getInstalledQueries((x) => {
      console.log('installed queries: ', x);
      this.installedQueries = [];

      for (const o of x) {
        const obj: InstalledDbQuery = { name: '', params: [] };
        for (const k in o) {
          if (k === 'query') {
            obj.name = o[k].default;
          } else {
            const o2 = {};
            o2[k] = o[k];
            const s = JSON.stringify(o2, null, 4).substr(2).slice(0, -2).replace('"', '').replace('"', '').trim();
            obj.params.push({ desc: s, inp: '', name: k });
          }
        }
        this.installedQueries.push(obj);
      }
    });
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

  loadInstalledQuery(q: InstalledDbQuery) {
    this.currInstalledQuery = q;
  }

  runInstalledQuery() {
    console.log('curr q: ', this.currInstalledQuery);
    const arr = [];
    for (const o of this.currInstalledQuery.params) {
      const o2 = {};
      o2[o.name] = o.inp;
      arr.push(o2);
    }
    this._tgApi.query((x) => {
      console.log('asd');
      this._s.loadGraph4InstalledQuery(x);
      this.rawInstalledQueryResponse = JSON.stringify(x, null, 4);
    }, this.currInstalledQuery.name, arr);
  }

}
