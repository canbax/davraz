import { Injectable } from '@angular/core';
import { DbQuery } from './data-types';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  constructor() { }

  upsertDbQuery(query: string, name: string) {
    const i = localStorage.getItem('db_q');
    let q = {};
    if (i) {
      q = JSON.parse(i);
    }
    q[name] = query;
    localStorage.setItem('db_q', JSON.stringify(q));
  }

  deleteDbQuery(name: string) {
    const i = localStorage.getItem('db_q');
    let q = {};
    if (i) {
      q = JSON.parse(i);
      delete q[name];
    }
    localStorage.setItem('db_q', JSON.stringify(q));
  }

  getAllDbQueries(): DbQuery[] {
    const i = localStorage.getItem('db_q');
    if (i) {
      const o = JSON.parse(i);
      const r: DbQuery[] = [];
      for (let k in o) {
        r.push({ name: k, query: o[k] });
      }
      return r;
    }
    return [];
  }
}
