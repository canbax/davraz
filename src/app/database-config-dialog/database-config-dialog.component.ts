import { Component } from '@angular/core';
import { TigerGraphApiClientService } from '../tiger-graph-api-client.service';

@Component({
  selector: 'app-database-config-dialog',
  templateUrl: './database-config-dialog.component.html',
  styleUrls: ['./database-config-dialog.component.css']
})
export class DatabaseConfigDialogComponent {

  url = '';
  secret = '';
  username = '';
  password = '';
  constructor(private _tgApi: TigerGraphApiClientService) {
    this._tgApi.getConfig(conf => {
      this.url = conf.url;
      this.secret = conf.secret;
      this.username = conf.username;
      this.password = conf.password;
    });
  }

  saveConfig() {
    this._tgApi.setConfig(this.url, this.secret, this.username, this.password);
  }
}
