import { Injectable } from '@angular/core';
import { DatabaseType, DbClient, GraphResponse, InterprettedQueryResult } from './data-types';
import { SettingsService } from './settings.service';
import { SharedService } from './shared.service';
import { TigerGraphApiClientService } from './tiger-graph-api-client.service';

@Injectable({
  providedIn: 'root'
})
export class DbClientService implements DbClient {

  client: DbClient;
  constructor(private _tgApi: TigerGraphApiClientService, private _s: SettingsService) {
    const dbVendor = this._s.getAppConfig().databaseType.getValue();
    if (dbVendor == DatabaseType.tigerGraph) {
      this.client = this._tgApi;
    } else {

    }
  }

  refreshToken(cb) {
    this.client.refreshToken(cb);
  }

  runQuery(q: string, cb: (r: InterprettedQueryResult) => void) {
    this.client.runQuery(q, cb);
  }

  sampleData(cb: (r: GraphResponse) => void, nodeCnt, edgeCnt) {
    this.client.sampleData(cb, nodeCnt, edgeCnt);
  }

  getNeighborsOfNode(cb: (r: GraphResponse) => void, elem) {
    this.client.getNeighborsOfNode(cb, elem);
  }

  runStoredProcedure(cb, query: string, params: any[]) {
    this.client.runStoredProcedure(cb, query, params);
  }

  getInstalledQueries(cb: (r: any[]) => void) {
    this.client.getInstalledQueries(cb);
  }
}
