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