import { Injectable } from '@angular/core';
import { DbQuery, AppConfig } from './data-types';
import { BehaviorSubject } from 'rxjs';
import { isPrimitiveType } from './constants';
import { APP_CONF } from './config/app-conf';

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

  getAppConfig(): AppConfig {
    const i = localStorage.getItem('app_config');
    let appConf: AppConfig = {} as AppConfig;
    if (i) {
      this.json2behaviourSubject(JSON.parse(i), appConf);
    } else {
      this.json2behaviourSubject(APP_CONF, appConf);
      // save app config if it does not exist
      this.setAppConfig(appConf);
    }
    return appConf;
  }

  setAppConfig(conf: AppConfig) {
    const o = this.appConf2Json(conf);
    localStorage.setItem('app_config', JSON.stringify(o));
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

  appConf2Json(conf: AppConfig) {
    const o = {};
    this.mapBehaviourSubject2Json(conf, o);
    return o;
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
