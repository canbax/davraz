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

export interface EdgeResponse {
  directed: boolean;
  e_type: string;
  attributes: any;
  from_id: string;
  from_type: string;
  to_id: string;
  to_type: string;
}