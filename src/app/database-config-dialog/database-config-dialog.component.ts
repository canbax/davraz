import { Component } from '@angular/core';
import { TigerGraphApiClientService } from '../tiger-graph-api-client.service';
import { TigerGraphDbConfig } from '../data-types';

@Component({
  selector: 'app-database-config-dialog',
  templateUrl: './database-config-dialog.component.html',
  styleUrls: ['./database-config-dialog.component.css']
})
export class DatabaseConfigDialogComponent {

  conf: TigerGraphDbConfig = { password: '', secret: '', token: '', tokenExpire: 0, url: '', username: '' };
  tokenExpireDateStr = '';
  constructor(private _tgApi: TigerGraphApiClientService) {
    this.syncConfig();
  }

  saveConfig() {
    this._tgApi.setConfig(this.conf, null);
  }

  refreshToken() {
    this._tgApi.refreshToken(this.conf.secret, (x) => {
      // this._tgApi.setConfig()
      this.conf.tokenExpire = x.expiration;
      this.conf.token = x.token;
      this._tgApi.setConfig(this.conf, this.syncConfig.bind(this));
    });
  }

  private syncConfig() {
    this._tgApi.getConfig(conf => {
      this.conf.url = conf.url;
      this.conf.secret = conf.secret;
      this.conf.username = conf.username;
      this.conf.password = conf.password;
      this.conf.token = conf.token;
      this.conf.tokenExpire = conf.tokenExpire;
      this.tokenExpireDateStr = new Date(this.conf.tokenExpire * 1000).toDateString();
    });
  }
}
