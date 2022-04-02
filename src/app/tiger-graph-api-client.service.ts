import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SettingsService } from './settings.service';
import { InterprettedQueryResult, GraphResponse, DbClient } from './data-types';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent } from './error-dialog/error-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class TigerGraphApiClientService implements DbClient {

  url: string;
  constructor(private _http: HttpClient, private _c: SettingsService, public dialog: MatDialog, private _snackBar: MatSnackBar) {
    this._c.appConf.tigerGraphDbConfig.proxyUrl.subscribe(x => {
      this.url = x;
    });
  }

  private errFn = (err) => {
    this._snackBar.open('Error in http request: ' + err.message, 'close');
  }

  private simpleRequest() {
    const conf = this._c.getConfAsJSON().tigerGraphDbConfig;
    this._http.post(`${this.url}/echo`, { token: conf.token, url: conf.url })
      .subscribe({
        next: x => {
          if (x['error']) {
            const dialogRef = this.dialog.open(ErrorDialogComponent);
            dialogRef.componentInstance.title = 'Error on http request';
            dialogRef.componentInstance.content = JSON.stringify(x);
            return;
          }
          console.log('resp: ', x);
        }, error: this.errFn
      });
  }

  refreshToken(cb) {
    const conf = this._c.getConfAsJSON().tigerGraphDbConfig;
    this._http.post(`${this.url}/requesttoken`,
      {
        graph: conf.graphName,
        username: conf.username, password: conf.password,
        url: conf.url
      })
      .subscribe({
        next: x => {
          if (x['error']) {
            const dialogRef = this.dialog.open(ErrorDialogComponent);
            dialogRef.componentInstance.title = 'Error on http request';
            dialogRef.componentInstance.content = JSON.stringify(x);
            return;
          }
          cb(x);
          console.log('resp: ', x);
        }, error: this.errFn
      });
  }

  // In terms of TigerGraph this is an InterPretted Query, https://docs.tigergraph.com/dev/gsql-ref/querying/query-operations#interpret-query
  runQuery(q: string, cb: (r: InterprettedQueryResult) => void) {
    const conf = this._c.getConfAsJSON().tigerGraphDbConfig;
    this._http.post(`${this.url}/gsql`, { q: q, username: conf.username, password: conf.password, url: conf.url },
      { headers: { 'Content-Type': 'application/json' } })
      .subscribe({ next: x => { cb(x as InterprettedQueryResult); }, error: this.errFn });
  }

  sampleData(cb: (r: GraphResponse) => void) {
    const conf = this._c.getConfAsJSON().tigerGraphDbConfig;
    const gsql = `INTERPRET QUERY () FOR GRAPH ${conf.graphName} {   
      start =   {ANY};
      results = SELECT s FROM start:s -(:e)-> :t LIMIT 10;
      PRINT results;
    }`;

    this._http.post(`${this.url}/gsql`, { q: gsql, username: conf.username, password: conf.password, url: conf.url },
      { headers: { 'Content-Type': 'application/json' } })
      .subscribe({
        next: (x: any) => {
          const nodes = x.results[0].results;
          cb({ edges: [], nodes: nodes });
        }, error: this.errFn
      });
  }

  getNeighborsOfNode(cb: (r: GraphResponse) => void, elem) {
    const id = elem.id().substr(2);

    const conf = this._c.getConfAsJSON().tigerGraphDbConfig;
    const gsql = `INTERPRET QUERY () FOR GRAPH ${conf.graphName} {   
      ListAccum<EDGE> @@edgeList;
      seed = {ANY};
    
      results = SELECT t
               FROM seed:s -(:e)->:t
               WHERE s.id == "${id}"
               ACCUM @@edgeList += e;
      
      PRINT  @@edgeList, results; 
    }`;

    this._http.post(`${this.url}/gsql`, { q: gsql, username: conf.username, password: conf.password, url: conf.url },
      { headers: { 'Content-Type': 'application/json' } })
      .subscribe({
        next: (x: any) => {
          const nodes = x.results[0].results;
          const edges = x.results[0]['@@edgeList'];
          cb({ edges: edges, nodes: nodes });
        }, error: this.errFn
      });
  }

  // In terms of TigerGraph this is simply a Query, https://docs.tigergraph.com/dev/gsql-ref/querying/introduction-query
  // You should first create the query then install it then call it. Actually, it looks more similar to a "Stored Procedure" in SQL terminology.
  runStoredProcedure(cb: (arg0: Object) => void, query: string, params: any[]) {
    const conf = this._c.getConfAsJSON().tigerGraphDbConfig;
    const body = { query: query, params: params, graphName: conf.graphName, url: conf.url, token: conf.token };
    this._http.post(`${this.url}/query`, body, { headers: { 'Content-Type': 'application/json' } }).subscribe({
      next: x => {
        if (x['error']) {
          const dialogRef = this.dialog.open(ErrorDialogComponent);
          dialogRef.componentInstance.title = 'Error on http request';
          dialogRef.componentInstance.content = JSON.stringify(x);
          return;
        }
        if (cb) {
          cb(x);
        }
        console.log('resp: ', x);
      }, error: this.errFn
    });
  }

  getStoredProcedures(cb: (r: any[]) => void) {
    const conf = this._c.getConfAsJSON().tigerGraphDbConfig;
    this._http.post(`${this.url}/endpoints`, { url: conf.url, token: conf.token }).subscribe({
      next: x => {
        const keyNames4query = Object.keys(x).filter(x => x.includes('/query/'));
        // Object.keys(x).filter(x => x.includes('/query')).map(x => {const arr = x.split('/'); return arr[arr.length-1]} )
        let endPoints = keyNames4query.map(x => { const arr = x.split('/'); return arr[arr.length - 1] });
        const namesOfQueries = new Set<string>(endPoints);

        let r = [];
        for (const name of namesOfQueries) {
          r.push(x['GET /query/' + name].parameters);
        }
        cb(r);
      }, error: this.errFn
    });
  }

  getGraphSchema(cb) {
    const conf = this._c.getConfAsJSON().tigerGraphDbConfig;
    this._http.post(`${this.url}/schema`,
      {
        url: conf.url, graph: conf.graphName,
        username: conf.username, password: conf.password,
      })
      .subscribe({
        next: x => {
          console.log("x: ", x);
          cb(x);
        }, error: this.errFn
      });
  }
}
