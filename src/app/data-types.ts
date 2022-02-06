import { BehaviorSubject } from 'rxjs';
import { isPrimitiveType } from './constants';

export interface InterprettedQueryResult {
  error: boolean;
  message: string;
  results: any[];
  version: { api: string, edition: string, schema: number };
}

export interface GraphResponse {
  nodes: NodeResponse[];
  edges: EdgeResponse[];
}

export interface NodeResponse {
  v_id: string;
  v_type: string;
  attributes: any;
}

export function isNodeResponse(x: any): boolean {
  if (x === undefined || x === null || isPrimitiveType(x)) {
    return false;
  }
  return 'v_id' in x && 'v_type' in x && 'attributes' in x;
}

export interface EdgeResponse {
  directed: boolean;
  e_type: string;
  attributes: any;
  from_id: string;
  from_type: string;
  to_id: string;
  to_type: string;
}

export function isEdgeResponse(x: any): boolean {
  if (x === undefined || x === null || isPrimitiveType(x)) {
    return false;
  }
  return 'directed' in x && 'e_type' in x && 'attributes' in x && 'from_id' in x && 'from_type' in x
    && 'to_id' in x && 'to_type' in x;
}

export interface SampleDataDialogData {
  nodeCnt: number;
  edgeCnt: number;
}

export interface AppConfig {
  highlightStyles: { wid: BehaviorSubject<number>, color: BehaviorSubject<string>, name: BehaviorSubject<string> }[];
  currHighlightIdx: BehaviorSubject<number>;
  isIgnoreCaseInText: BehaviorSubject<boolean>;
  graphHistoryLimit: BehaviorSubject<number>;
  currLayout: BehaviorSubject<string>;

  nodeTypes: BehaviorSubject<string>[];
  databaseType: BehaviorSubject<DatabaseType>;
  tigerGraphDbConfig: {
    url: BehaviorSubject<string>;
    secret: BehaviorSubject<string>;
    username: BehaviorSubject<string>;
    password: BehaviorSubject<string>;
    token: BehaviorSubject<string>;
    tokenExpire: BehaviorSubject<number>;
    graphName: BehaviorSubject<string>;
    proxyUrl: BehaviorSubject<string>;
  },
  neo4jDbConfig: {
    url: BehaviorSubject<string>;
    username: BehaviorSubject<string>;
    password: BehaviorSubject<string>;
  }
}

export interface TigerGraphDbConfig {
  url: string;
  secret: string;
  username: string;
  password: string;
  token: string;
  tokenExpire: number;
  graphName: string;
  proxyUrl: string;
}

export interface Neo4jDbConfig {
  url: string;
  username: string;
  password: string;
}

export interface DbQuery {
  name: string;
  query: string;
}

export interface TableData {
  columns: string[];
  data: any[];
}

export interface InstalledDbQuery {
  name: string;
  params: { name: string, desc: string, inp: string, obj: any }[];
}

export interface GraphHistoryItem {
  expo: string;
  base64png: string;
  json: any;
}

export enum DatabaseType {
  tigerGraph = 0,
  neo4j = 1
}

export interface DbClient {

  refreshToken: (cb) => void;

  runQuery: (q: string, cb: (r: InterprettedQueryResult) => void) => void;

  sampleData: (cb: (r: GraphResponse) => void) => void;

  getNeighborsOfNode: (cb: (r: GraphResponse) => void, elem) => void;

  runStoredProcedure: (cb, query: string, params: any[]) => void;

  getStoredProcedures: (cb: (r: any[]) => void) => void;

}