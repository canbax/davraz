import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SettingsService } from './settings.service';
import { InterprettedQueryResult, GraphResponse, NodeResponse, EdgeResponse, TigerGraphDbConfig } from './data-types';
import { combineLatest, Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent } from './error-dialog/error-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class TigerGraphApiClientService {

  url: string;
  constructor(private _http: HttpClient, private _settings: SettingsService, public dialog: MatDialog) {
    this.url = this._settings.getAppConfig().server.getValue();
  }

  getConfig(cb: (conf: TigerGraphDbConfig) => void) {
    this._http.get(`${this.url}/getdbconfig`)
      .subscribe(x => { cb(x as TigerGraphDbConfig) });
  }

  setConfig(config: TigerGraphDbConfig, cb) {
    this._http.post(`${this.url}/setdbconfig`, config, { headers: { 'Content-Type': 'application/json' } }).subscribe(x => {
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
    });
  }

  refreshToken(secret, cb) {
    this._http.get(`${this.url}/requesttoken?secret=${secret}`)
      .subscribe(x => {
        if (x['error']) {
          const dialogRef = this.dialog.open(ErrorDialogComponent);
          dialogRef.componentInstance.title = 'Error on http request';
          dialogRef.componentInstance.content = JSON.stringify(x);
          return;
        }
        cb(x);
        console.log('resp: ', x);
      });
  }

  simpleRequest() {
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        console.log(this.responseText);
      }
    };
    xmlhttp.open('GET', 'http://localhost:9000/echo', true);
    xmlhttp.send();
  }

  runInterprettedQuery(q: string, cb: (r: InterprettedQueryResult) => void) {
    this._http.post(`${this.url}/gsql`, { q: q },
      { headers: { 'Content-Type': 'application/json' } })
      .subscribe(x => { cb(x as InterprettedQueryResult); });
  }

  sampleData(cb: (r: GraphResponse) => void, nodeCnt = 5, edgeCnt = 3) {
    const nodeTypes = ['BusRide', 'TrainRide', 'Flight', 'FundsTransfer', 'PhoneCall', 'Person', 'HotelStay', 'Phone', 'BankAccount', 'CaseReport', 'Address'];
    let firstNodes: NodeResponse[] = [];
    const arr: Observable<Object>[] = [];
    for (const t of nodeTypes) {
      const o = this._http.get(`${this.url}/samplenodes?cnt=${nodeCnt}&type=${t}`);
      arr.push(o);
      o.subscribe(x => {
        firstNodes = firstNodes.concat((x as GraphResponse).nodes);
      });
    }

    let firstEdges: EdgeResponse[] = [];
    const arr2: Observable<Object>[] = [];
    // after we get all the nodes get edges from these nodes
    combineLatest(arr).subscribe(() => {
      for (const n of firstNodes) {
        if (n == null) {
          continue;
        }
        const o = this._http.get(`${this.url}/edges4nodes?cnt=${edgeCnt}&src_type=${n.v_type}&id=${n.v_id}`);
        arr2.push(o);
        o.subscribe(x => {
          firstEdges = firstEdges.concat((x as GraphResponse).edges);
        })
      }

      let secondNodes: NodeResponse[] = [];
      const arr3: Observable<Object>[] = [];
      // get target nodes of the edges
      combineLatest(arr2).subscribe(() => {
        for (const e of firstEdges) {
          const o = this._http.get(`${this.url}/nodes4edges?cnt=${nodeCnt}&type=${e.to_type}&id=${e.to_id}`);
          arr3.push(o);
          o.subscribe(x => {
            secondNodes = secondNodes.concat((x as GraphResponse).nodes);
          })
        }

        // we should add edges to graph after we get both source and target's of edges
        combineLatest(arr3).subscribe(() => {
          cb({ edges: firstEdges, nodes: firstNodes.concat(secondNodes) });
        });
      });
      if (arr2.length < 1) {
        cb({ edges: [], nodes: [] });
      }
    });
  }

  endPoints(cb: (r: InterprettedQueryResult) => void) {
    this._http.get(`${this.url}/endpoints`).subscribe(x => { cb(x as InterprettedQueryResult) });
  }

  getNeighborsOfNode(cb: (r: GraphResponse) => void, elem) {
    const t = elem.classes()[0];
    const id = elem.id().substr(2);
    let edges: EdgeResponse[] = [];
    let nodes: NodeResponse[] = [];
    this._http.get(`${this.url}/edges4nodes?cnt=1000&src_type=${t}&id=${id}`).subscribe(x => {
      const resp = x as GraphResponse;
      const arr: Observable<Object>[] = [];
      edges = edges.concat(resp.edges);
      for (const e of resp.edges) {
        const o = this._http.get(`${this.url}/nodes4edges?cnt=1000&type=${e.to_type}&id=${e.to_id}`);
        arr.push(o);
        o.subscribe(x2 => {
          nodes = nodes.concat((x2 as GraphResponse).nodes);
        })
      }
      combineLatest(arr).subscribe(() => {
        cb({ edges: edges, nodes: nodes });
      });
    });
  }

  query(cb, query: string, params: any[]) {
    this._http.post(`${this.url}/query`, { query: query, params: params }, { headers: { 'Content-Type': 'application/json' } }).subscribe(x => {
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
    });
  }

  getInstalledQueries(cb: (r: any[]) => void) {
    this._http.get(`${this.url}/endpoints`).subscribe(x => {
      const keyNames4query = Object.keys(x).filter(x => x.includes('/query/'));
      // Object.keys(x).filter(x => x.includes('/query')).map(x => {const arr = x.split('/'); return arr[arr.length-1]} )
      let endPoints = keyNames4query.map(x => { const arr = x.split('/'); return arr[arr.length - 1] });
      const namesOfQueries = new Set<string>(endPoints);

      let r = [];
      for (const name of namesOfQueries) {
        r.push(x['GET /query/' + name].parameters);
      }
      cb(r);
    });
  }
}
