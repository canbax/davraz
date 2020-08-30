import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SettingsService } from './settings.service';
import { PROXY_URL } from './constants';
import { DbConfig, InterprettedQueryResult, GraphResponse, NodeResponse, EdgeResponse, TigerGraphDbConfig } from './data-types';
import { combineLatest, Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent } from './error-dialog/error-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class TigerGraphApiClientService {

  constructor(private _http: HttpClient, private _settings: SettingsService, public dialog: MatDialog) { }

  getConfig(cb: (conf: DbConfig) => void) {
    this._http.get(`${PROXY_URL}/getdbconfig`)
      .subscribe(x => { cb(x as DbConfig) });
  }

  setConfig(config: TigerGraphDbConfig, cb) {
    this._http.post(`${PROXY_URL}/setdbconfig`, config, { headers: { 'Content-Type': 'application/json' } }).subscribe(x => {
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
    this._http.get(`${PROXY_URL}/requesttoken?secret=${secret}`)
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
    this._http.post(`${PROXY_URL}/gsql`, { q: q },
      { headers: { 'Content-Type': 'application/json' } })
      .subscribe(x => { cb(x as InterprettedQueryResult); });
  }

  sampleData(cb: (r: GraphResponse) => void, nodeCnt = 5, edgeCnt = 3) {

    const nodeTypes = ['BusRide', 'TrainRide', 'Flight', 'FundsTransfer', 'PhoneCall', 'Person', 'HotelStay', 'Phone', 'BankAccount', 'CaseReport', 'Address'];
    let firstNodes: NodeResponse[] = [];
    const arr: Observable<Object>[] = [];
    for (const t of nodeTypes) {
      const o = this._http.get(`${PROXY_URL}/samplenodes?cnt=${nodeCnt}&type=${t}`);
      arr.push(o);
      o.subscribe(x => {
        cb(x as GraphResponse);
        firstNodes = firstNodes.concat((x as GraphResponse).nodes);
      });
    }

    let firstEdges: EdgeResponse[] = [];
    const arr2: Observable<Object>[] = [];
    // after we get all the nodes get edges from these nodes
    combineLatest(arr).subscribe(() => {
      console.log('got first node set: ', firstNodes);
      for (const n of firstNodes) {
        const o = this._http.get(`${PROXY_URL}/edges4nodes?cnt=${edgeCnt}&src_type=${n.v_type}&id=${n.v_id}`);
        arr2.push(o);
        o.subscribe(x => {
          firstEdges = firstEdges.concat((x as GraphResponse).edges);
        })
      }

      let secondNodes: NodeResponse[] = [];
      const arr3: Observable<Object>[] = [];
      // get target nodes of the edges
      combineLatest(arr2).subscribe(() => {
        console.log('got edge set: ', firstEdges);
        for (const e of firstEdges) {
          const o = this._http.get(`${PROXY_URL}/nodes4edges?cnt=${nodeCnt}&type=${e.to_type}&id=${e.to_id}`);
          arr3.push(o);
          o.subscribe(x => {
            cb(x as GraphResponse);
            secondNodes = secondNodes.concat((x as GraphResponse).nodes);
          })
        }

        // we should add edges to graph after we get both source and target's of edges
        combineLatest(arr3).subscribe(() => {
          console.log('got target node set: ', secondNodes);
          cb({ edges: firstEdges, nodes: [] });
        });
      });
    });
  }

  endPoints(cb: (r: InterprettedQueryResult) => void) {
    this._http.get(`${PROXY_URL}/endpoints`).subscribe(x => { cb(x as InterprettedQueryResult) });
  }

}
