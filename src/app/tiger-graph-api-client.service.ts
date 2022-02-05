import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SettingsService } from './settings.service';
import { InterprettedQueryResult, GraphResponse, NodeResponse, EdgeResponse, DbClient } from './data-types';
import { combineLatest, Observable } from 'rxjs';
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
    this._http.post(`${this.url}/requesttoken`, { secret: conf.secret, url: conf.url })
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
    const t = elem.classes()[0];
    const id = elem.id().substr(2);
    let edges: EdgeResponse[] = [];
    let nodes: NodeResponse[] = [];
    const conf = this._c.getConfAsJSON().tigerGraphDbConfig;
    this._http.post(`${this.url}/edges4nodes`, { cnt: 1000, src_type: t, id: id, graphName: conf.graphName, url: conf.url, token: conf.token }).subscribe({
      next: x => {
        const resp = x as GraphResponse;
        const arr: Observable<Object>[] = [];
        edges = edges.concat(resp.edges);
        for (const e of resp.edges) {
          const o = this._http.post(`${this.url}/nodes4edges`, { cnt: 1000, type: e.to_type, id: e.to_id, graphName: conf.graphName, url: conf.url, token: conf.token });
          arr.push(o);
          o.subscribe({
            next: x2 => {
              nodes = nodes.concat((x2 as GraphResponse).nodes);
            }, error: this.errFn
          });

          const o2 = this._http.post(`${this.url}/nodes4edges`, { cnt: 1000, type: e.from_type, id: e.from_id, graphName: conf.graphName, url: conf.url, token: conf.token });
          arr.push(o2);
          o2.subscribe({
            next: x2 => {
              nodes = nodes.concat((x2 as GraphResponse).nodes);
            }, error: this.errFn
          });
        }
        combineLatest(arr).subscribe({
          next: () => {
            cb({ edges: edges, nodes: nodes });
          }, error: this.errFn
        });
      }, error: this.errFn
    });
  }

  // In terms of TigerGraph this is simply a Query, https://docs.tigergraph.com/dev/gsql-ref/querying/introduction-query
  // You should first create the query then install it then call it. Actually, it looks more similar to a "Stored Procedure" in SQL terminology.
  runStoredProcedure(cb, query: string, params: any[]) {
    this._http.post(`${this.url} / query`, { query: query, params: params }, { headers: { 'Content-Type': 'application/json' } }).subscribe({
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
}
