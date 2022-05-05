import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SettingsService } from './settings.service';
import { InterprettedQueryResult, GraphResponse, DbClient, SchemaOutput, TigerGraphVertexType, TigerGraphEdgeType } from './data-types';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent } from './error-dialog/error-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class TigerGraphApiClientService implements DbClient {

  url: string = '';
  dataSchema: {
    EdgeTypes: TigerGraphEdgeType[],
    VertexTypes: TigerGraphVertexType[],
  }
  onErrFn = null;
  constructor(private _http: HttpClient, private _c: SettingsService, public dialog: MatDialog, private _snackBar: MatSnackBar) {
    this._c.appConf.tigerGraphDbConfig.proxyUrl.subscribe((x: string) => {
      this.url = x;
    });
  }

  private errFn = (err: any) => {
    this._snackBar.open('Error in http request: ' + JSON.stringify(err), 'x');
    if (this.onErrFn && typeof this.onErrFn == "function") {
      this.onErrFn();
    }
  }

  private simpleRequest() {
    const conf = this._c.getConfAsJSON().tigerGraphDbConfig;
    this._http.post(`${this.url}/echo`, { token: conf.token, url: conf.url })
      .subscribe({
        next: x => {
          if (x['error']) {
            this.errFn(x);
            return;
          }
          console.log('resp: ', x);
        }, error: this.errFn
      });
  }

  refreshToken(cb: (arg0: Object) => void) {
    const conf = this._c.getConfAsJSON().tigerGraphDbConfig;
    this._http.post(`${this.url}/requesttoken`, {
      graph: conf.graphName,
      username: conf.username, password: conf.password,
      url: conf.url
    })
      .subscribe({
        next: x => {
          if (x['error']) {
            this.errFn(x);
            return;
          }
          cb(x);
          this._c.appConf.tigerGraphDbConfig.isConnected.next(true);
          this._c.setAppConfig();
          console.log('resp: ', x);
        }, error: this.errFn
      });
  }

  // In terms of TigerGraph this is an InterPretted Query, https://docs.tigergraph.com/dev/gsql-ref/querying/query-operations#interpret-query
  runQuery(q: string, cb: (r: InterprettedQueryResult) => void) {
    const conf = this._c.getConfAsJSON().tigerGraphDbConfig;
    if (!conf.isConnected) {
      return;
    }
    this._http.post(`${this.url}/gsql`, { q: q, username: conf.username, password: conf.password, url: conf.url },
      { headers: { 'Content-Type': 'application/json' } })
      .subscribe({ next: x => { cb(x as InterprettedQueryResult); }, error: this.errFn });
  }

  sampleData(cb: (r: GraphResponse) => void) {
    const conf = this._c.getConfAsJSON().tigerGraphDbConfig;
    if (!conf.isConnected) {
      return;
    }
    const gsql = `INTERPRET QUERY () FOR GRAPH ${conf.graphName} {   
      start =   {ANY};
      results = SELECT s FROM start:s -(:e)- :t LIMIT 10;
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

  getNeighborsOfNode(cb: (r: GraphResponse) => void, elem: any, otherNodeType: string = '') {
    const id = elem.id().substring(2);
    const vertexType = this.dataSchema.VertexTypes.find(x => x.Name == elem.classes()[0]);

    const conf = this._c.getConfAsJSON().tigerGraphDbConfig;
    if (!conf.isConnected) {
      return;
    }
    const gsql = `INTERPRET QUERY () FOR GRAPH ${conf.graphName} {   
      ListAccum<EDGE> @@edgeList;
      seed = {ANY};
    
      results = SELECT t
               FROM seed:s -(:e)-${otherNodeType}:t
               WHERE s.${vertexType.PrimaryId.AttributeName} == "${id}"
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
    if (!conf.isConnected) {
      return;
    }
    const body = { query: query, params: params, graphName: conf.graphName, url: conf.url, token: conf.token };
    this._http.post(`${this.url}/query`, body, { headers: { 'Content-Type': 'application/json' } }).subscribe({
      next: x => {
        if (x['error']) {
          this.errFn(x)
          return;
        }
        if (cb) {
          cb(x);
        }
      }, error: this.errFn
    });
  }

  getStoredProcedures(cb: (r: any[]) => void) {
    const conf = this._c.getConfAsJSON().tigerGraphDbConfig;
    if (!conf.isConnected) {
      return;
    }
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
    if (!conf.isConnected) {
      return;
    }
    this._http.post(`${this.url}/schema`,
      {
        url: conf.url, graph: conf.graphName,
        username: conf.username, password: conf.password,
      })
      .subscribe({
        next: (x) => {
          let y = x as SchemaOutput;
          if (y.error) {
            this.errFn(y);
            return;
          }
          this.dataSchema = y.results;
          cb(x);
        }, error: this.errFn
      });
  }
}
