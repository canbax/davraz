import { Injectable } from '@angular/core';
import { DbQuery, AppConfig, TigerGraphDbConfig, Neo4jDbConfig } from './data-types';
import { BehaviorSubject } from 'rxjs';
import { isPrimitiveType } from './constants';
import { APP_CONF } from './config/app-conf';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  public appConf: AppConfig;

  constructor() {
    this.appConf = this.getAppConfig();
  }

  getConfAsJSON(): any {
    return this.appConf2Json(this.appConf);
  }

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

  // AppConfig should be reached from SharedService to keep the data sync
  private getAppConfig(): AppConfig {
    const i = localStorage.getItem('app_config');
    let appConf: AppConfig = {} as AppConfig;
    this.json2behaviourSubject(APP_CONF, appConf);
    if (i) {
      this.json2behaviourSubject(JSON.parse(i), appConf);
    } else {
      // save app config if it does not exist
      this.setAppConfig();
    }
    return appConf;
  }

  // AppConfig should be reached from SharedService to keep the data sync
  setAppConfig() {
    const o = this.appConf2Json(this.appConf);
    localStorage.setItem('app_config', JSON.stringify(o));
  }

  getRecentCyStyle(): string {
    return localStorage.getItem('cy_style');
  }

  setRecentCyStyle(jsonStr: string) {
    localStorage.setItem('cy_style', jsonStr);
  }

  appConf2Json(conf: AppConfig) {
    const o = {};
    this.mapBehaviourSubject2Json(conf, o);
    return o;
  }

  // convert primitive types in JSON to behaviour subject of that primitive type
  private json2behaviourSubject(obj: any, userPref: any) {
    if (obj === undefined || obj === null) {
      return;
    }
    for (let k in obj) {
      let prop = obj[k];
      if (isPrimitiveType(prop)) {
        if (userPref[k]) {
          (userPref[k] as BehaviorSubject<any>).next(prop);
        } else {
          userPref[k] = new BehaviorSubject(prop);
        }
      } else {
        if (!userPref[k]) {
          if (prop instanceof Array) {
            userPref[k] = [];
          } else {
            userPref[k] = {};
          }
        }
        this.json2behaviourSubject(obj[k], userPref[k]);
      }
    }
  }

  private mapBehaviourSubject2Json(obj, mappedObj) {
    for (const k in obj) {
      if (obj[k] instanceof BehaviorSubject) {
        mappedObj[k] = (obj[k] as BehaviorSubject<any>).getValue();
      } else {
        if (obj[k] instanceof Array) {
          mappedObj[k] = [];
        } else {
          mappedObj[k] = {};
        }
        this.mapBehaviourSubject2Json(obj[k], mappedObj[k]);
      }
    }
  }
}
