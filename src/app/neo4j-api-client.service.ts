import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { combineLatest, Observable } from 'rxjs';
import { DbClient, EdgeResponse, GraphResponse, InterprettedQueryResult, NodeResponse } from './data-types';
import { ErrorDialogComponent } from './error-dialog/error-dialog.component';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class Neo4jApiClientService implements DbClient {

  constructor(private _http: HttpClient, private _settings: SettingsService, public dialog: MatDialog, private _snackBar: MatSnackBar) {
  }

  private errFn = (err) => {
    const msg = JSON.stringify(err);
    console.log('err: ', msg);
    this._snackBar.open('Error in http request: ' + err.message, 'close');
  }

  private run(cql, cb) {
    const conf = this._settings.getAppConfig().neo4jDbConfig;
    const url = conf.url.getValue();
    const username = conf.username.getValue();
    const password = conf.password.getValue();
    const requestType = 'graph';
    const requestBody = {
      statements: [{
        statement: cql,
        parameters: null,
        resultDataContents: [requestType]
      }]
    };

    const errFn = (err) => {

    };

    this._http.post(url, requestBody, {
      headers: {
        'Accept': 'application/json; charset=UTF-8',
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(username + ':' + password)
      }
    }).subscribe(x => {
      if (x['errors'] && x['errors'].length > 0) {
        errFn(x['errors'][0]);
        return;
      }
      cb(this.extractGraph(x));
    }, errFn);
  }

  private extractGraph(response): GraphResponse {
    let nodes = [];
    let edges = [];

    const results = response.results[0];
    if (!results) {
      console.log('no results!');
      return;
    }

    const data = response.results[0].data;
    for (let i = 0; i < data.length; i++) {
      const graph = data[i].graph;
      const graph_nodes = graph.nodes;
      const graph_edges = graph.relationships;

      for (let node of graph_nodes) {
        nodes.push(node);
      }

      for (let edge of graph_edges) {
        edges.push(edge);
      }
    }

    return { 'nodes': nodes, 'edges': edges };
  }

  refreshToken(cb) { }

  runQuery(q: string, cb: (r: InterprettedQueryResult) => void) {
    
  }

  sampleData(cb: (r: GraphResponse) => void, nodeCnt = 5, edgeCnt = 3) {
    
  }

  getNeighborsOfNode(cb: (r: GraphResponse) => void, elem) {
    
  }

  // In terms of TigerGraph this is simply a Query, https://docs.tigergraph.com/dev/gsql-ref/querying/introduction-query
  // You should first create the query then install it then call it. Actually, it looks more similar to a "Stored Procedure" in SQL terminology.
  runStoredProcedure(cb, query: string, params: any[]) {
    
  }

  getStoredProcedures(cb: (r: any[]) => void) {
    
  }
}
