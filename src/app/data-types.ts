import { BehaviorSubject } from 'rxjs';
import { isPrimitiveType } from './constants';

export interface DbConfig {
  url: string;
  secret: string;
  token: string;
  tokenExpire: number;
  username: string;
  password: string;
}

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
  sampleDataNodeCount: BehaviorSubject<number>;
  sampleDataEdgeCount: BehaviorSubject<number>;
  currLayout: BehaviorSubject<string>;
}

export interface TigerGraphDbConfig {
  url: string;
  secret: string;
  username: string;
  password: string;
  token: string;
  tokenExpire: number;
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
