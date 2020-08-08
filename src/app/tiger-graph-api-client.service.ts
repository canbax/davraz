import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SettingsService } from './settings.service';
import { PROXY_URL } from './constants';
import { DbConfig } from './data-types';

@Injectable({
  providedIn: 'root'
})
export class TigerGraphApiClientService {

  constructor(private _http: HttpClient, private _settings: SettingsService) { }

  getConfig(cb: (conf: DbConfig) => void) {
    this._http.get(`${PROXY_URL}/getdbconfig`)
      .subscribe(x => { cb(x as DbConfig) });
  }

  setConfig(url: string, secret: string, username: string, password: string) {
    this._http.get(`${PROXY_URL}/setdbconfig?url=${url}&secret=${secret}&username=${username}&password=${password}`);
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

  runInterprettedQuery(q: string) {
    this._http.post(`${PROXY_URL}/gsql`, { q: q },
      { headers: { 'Content-Type': 'application/json' } })
      .subscribe(x => { console.log('result of http post'); });
    // this._http.get(`${PROXY_URL}/gsql?q=${q}`).subscribe(x => { console.log('result of get') });
  }
}
