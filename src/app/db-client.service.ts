import { Injectable } from '@angular/core';
import { DatabaseType, DbClient, GraphResponse, InterprettedQueryResult } from './data-types';
import { TigerGraphApiClientService } from './tiger-graph-api-client.service';
import { Neo4jApiClientService } from './neo4j-api-client.service';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class DbClientService implements DbClient {

  client: DbClient;
  constructor(private _tgApi: TigerGraphApiClientService, private _c: SettingsService, private _neo4jApi: Neo4jApiClientService) {
    const dbVendor = this._c.appConf.databaseType.getValue();
    if (dbVendor == DatabaseType.tigerGraph) {
      this.client = this._tgApi;
    } else if (dbVendor == DatabaseType.neo4j) {
      this.client = this._neo4jApi;
    }
  }

  refreshToken(cb) {
    this.client.refreshToken(cb);
  }

  runQuery(q: string, cb: (r: InterprettedQueryResult) => void) {
    this.client.runQuery(q, cb);
  }

  sampleData(cb: (r: GraphResponse) => void) {
    this.client.sampleData(cb);
  }

  getNeighborsOfNode(cb: (r: GraphResponse) => void, elem) {
    this.client.getNeighborsOfNode(cb, elem);
  }

  runStoredProcedure(cb, query: string, params: any[]) {
    this.client.runStoredProcedure(cb, query, params);
  }

  getStoredProcedures(cb: (r: any[]) => void) {
    this.client.getStoredProcedures(cb);
  }

  getGraphSchema(cb) {
    this.client.getGraphSchema(cb);
  }
}
