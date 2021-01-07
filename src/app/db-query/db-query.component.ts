import { Component, OnInit } from '@angular/core';
import { TigerGraphApiClientService } from '../tiger-graph-api-client.service';
import { DbClientService } from '../db-client.service';
import { SharedService } from '../shared.service';
import { DbQuery, InstalledDbQuery } from '../data-types';
import { SettingsService } from '../settings.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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

  constructor(private _dbApi: DbClientService, private _s: SharedService, private _settings: SettingsService, private _snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.queries = this._settings.getAllDbQueries();
    this._dbApi.getStoredProcedures((x) => {
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
            obj.params.push({ desc: s, inp: '', name: k, obj: o[k] });
          }
        }
        this.installedQueries.push(obj);
      }
    });

    if (this.queries && this.queries.length > 0) {
      this.loadQuery(this.queries[0]);
    }
  }

  runQuery() {
    this._dbApi.runQuery(this.gsql, (x) => {
      if (!x || !(x.results)) {
        this._snackBar.open('Empty response from query: ' + JSON.stringify(x), 'close');
        return;
      }
      this._s.loadGraph({ nodes: x.results[0].results, edges: [] });
      this._s.add2GraphHistory('run interpretted query');
    });
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
    const arr = [];
    for (const o of this.currInstalledQuery.params) {
      const o2 = {};
      o2[o.name] = o.inp;
      arr.push(o2);
    }
    this._dbApi.runStoredProcedure((x) => {
      this._s.loadGraph4InstalledQuery(x);
      this._s.add2GraphHistory('installed query');
      this.rawInstalledQueryResponse = JSON.stringify(x, null, 4);
      for (let i = 0; i < this.currInstalledQuery.params.length; i++) {
        const obj = this.currInstalledQuery.params[i].obj;
        if (obj.is_id === 'true') {
          let elem = this._s.cy.$id('n_' + this.currInstalledQuery.params[i].inp).filter('.' + obj.id_type);
          // might be edge also
          if (elem.length < 1) {
            elem = this._s.cy.$id('e_' + this.currInstalledQuery.params[i].inp).filter('.' + obj.id_type);
          }
          this._s.viewUtils.highlight(elem, this._s.appConf.currHighlightIdx.getValue());
        }
      }
    }, this.currInstalledQuery.name, arr);
  }

}
