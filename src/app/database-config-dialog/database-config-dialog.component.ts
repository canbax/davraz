import { Component } from '@angular/core';
import { TigerGraphApiClientService } from '../tiger-graph-api-client.service';
import { TigerGraphDbConfig, AppConfig } from '../data-types';
import { SettingsService } from '../settings.service';

@Component({
  selector: 'app-database-config-dialog',
  templateUrl: './database-config-dialog.component.html',
  styleUrls: ['./database-config-dialog.component.css']
})
export class DatabaseConfigDialogComponent {

  dbConf: TigerGraphDbConfig = { password: '', secret: '', token: '', tokenExpire: 0, url: '', username: '' };
  tokenExpireDateStr = '';
  appConf: AppConfig;
  constructor(private _tgApi: TigerGraphApiClientService, private _settings: SettingsService) {
    this.syncDbConfig();
    this.appConf = this._settings.getAppConfig();
  }

  saveDbConfig() {
    this._tgApi.setConfig(this.dbConf, null);
  }

  refreshDbToken() {
    this._tgApi.refreshToken(this.dbConf.secret, (x) => {
      this.dbConf.tokenExpire = x.expiration;
      this.dbConf.token = x.token;
      this._tgApi.setConfig(this.dbConf, this.syncDbConfig.bind(this));
    });
  }

  private syncDbConfig() {
    this._tgApi.getConfig(dbConf => {
      this.dbConf.url = dbConf.url;
      this.dbConf.secret = dbConf.secret;
      this.dbConf.username = dbConf.username;
      this.dbConf.password = dbConf.password;
      this.dbConf.token = dbConf.token;
      this.dbConf.tokenExpire = dbConf.tokenExpire;
      this.tokenExpireDateStr = new Date(this.dbConf.tokenExpire * 1000).toDateString();
    });
  }
}
