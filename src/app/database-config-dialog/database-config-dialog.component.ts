import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DbConfig } from '../data-types';

@Component({
  selector: 'app-database-config-dialog',
  templateUrl: './database-config-dialog.component.html',
  styleUrls: ['./database-config-dialog.component.css']
})
export class DatabaseConfigDialogComponent {

  url = '';
  secret = '';
  proxy_url = 'http://localhost:9000';
  constructor(private _http: HttpClient) {
    this._http.get(`${this.proxy_url}/getdbconfig`)
      .subscribe(x => {
        const conf = x as DbConfig;
        this.url = conf.url;
        this.secret = conf.secret;
      });
  }

  saveConfig() {
    this._http.get(`${this.proxy_url}/setdbconfig?url=${this.url}&secret=${this.secret}`).subscribe(x => { console.log('db config: ', x) });
  }


}
