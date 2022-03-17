import { Component } from '@angular/core';
import { TigerGraphDbConfig, AppConfig, DatabaseType, Neo4jDbConfig } from '../data-types';
import { getCyStyleFromColorAndWid, Layout } from '../constants';
import { SharedService } from '../shared.service';
import { BehaviorSubject } from 'rxjs';
import { DbClientService } from '../db-client.service';
import { SettingsService } from '../settings.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-config-dialog',
  templateUrl: './config-dialog.component.html',
  styleUrls: ['./config-dialog.component.css']
})
export class ConfigDialogComponent {

  tigerGraphDbConf: TigerGraphDbConfig = { password: '', secret: '', token: '', tokenExpire: 0, url: '', username: '', graphName: '', proxyUrl: '' };
  neo4jDbConf: Neo4jDbConfig = { url: '', username: '', password: '' };
  tokenExpireDateStr = '';
  appConf: AppConfig;
  currHighlightStyle: { wid: number, color: string, name: string };
  currHighlightIdx: number;
  isIgnoreCaseInText: boolean;
  databaseType: DatabaseType;
  dbTypes: { enum: DatabaseType, str: string }[];
  layoutOptions: string[];
  currLayout: string;
  nodeTypes: string[] = [];

  constructor(private _s: SharedService, private _c: SettingsService, private _dbApi: DbClientService, private _snackBar: MatSnackBar) {
    this.syncDbConfig();
    this.syncAppConfig();
    this.layoutOptions = Object.keys(Layout);
    this.dbTypes = [{ str: 'TigerGraph', enum: DatabaseType.tigerGraph }, { str: 'Neo4j', enum: DatabaseType.neo4j }];
  }

  copy(txt: string) {
    this.showSnackbar(`'${txt}' copied!`);
  }

  private showSnackbar(txt: string) {
    this._snackBar.open(txt, 'OK', {
      duration: 5000
    });
  }

  saveDbConfig() {
    this.changeTigerGraphDbConfigs();
    this.changeNeo4jDbConfigs();
  }

  refreshDbToken() {
    this._s.isLoading.next(true);
    this._dbApi.refreshToken((x) => {
      this.tigerGraphDbConf.tokenExpire = x.expiration;
      this.tigerGraphDbConf.token = x.results.token;
      this.changeTigerGraphDbConfigs();
    });
  }

  private syncAppConfig() {
    this.appConf = this._c.appConf;
    this.currHighlightIdx = this.appConf.currHighlightIdx.getValue();
    const curr = this.appConf.highlightStyles[this.currHighlightIdx];
    this.currHighlightStyle = { color: curr.color.getValue(), name: curr.name.getValue(), wid: curr.wid.getValue() };
    this.isIgnoreCaseInText = this.appConf.isIgnoreCaseInText.getValue();
    this.currLayout = this.appConf.currLayout.getValue();
    this.nodeTypes = this.appConf.nodeTypes.map(x => x.getValue());
    this.databaseType = this.appConf.databaseType.getValue();
  }

  private syncDbConfig() {
    const c = this._c.appConf.tigerGraphDbConfig;
    this.tigerGraphDbConf.url = c.url.getValue();
    this.tigerGraphDbConf.secret = c.secret.getValue();
    this.tigerGraphDbConf.username = c.username.getValue();
    this.tigerGraphDbConf.password = c.password.getValue();
    this.tigerGraphDbConf.token = c.token.getValue();
    this.tigerGraphDbConf.tokenExpire = c.tokenExpire.getValue();
    this.tigerGraphDbConf.graphName = c.graphName.getValue();
    this.tigerGraphDbConf.proxyUrl = c.proxyUrl.getValue();
    this.tokenExpireDateStr = new Date(this.tigerGraphDbConf.tokenExpire * 1000).toDateString();

    const c2 = this._c.appConf.neo4jDbConfig;
    this.neo4jDbConf.url = c2.url.getValue();
    this.neo4jDbConf.username = c2.username.getValue();
    this.neo4jDbConf.password = c2.password.getValue();
  }

  changeCurrHiglightStyle() {
    const curr = this.appConf.highlightStyles[this.currHighlightIdx];
    this.appConf.currHighlightIdx.next(this.currHighlightIdx);
    this.currHighlightStyle.color = curr.color.getValue();
    this.currHighlightStyle.name = curr.name.getValue();
    this.currHighlightStyle.wid = curr.wid.getValue();
    this._c.setAppConfig();
  }

  changeHighlightStyle() {
    let cyStyle = getCyStyleFromColorAndWid(this.currHighlightStyle.color, this.currHighlightStyle.wid);
    this._s.viewUtils.changeHighlightStyle(this.currHighlightIdx, cyStyle.nodeCss, cyStyle.edgeCss);

    this.appConf.highlightStyles[this.currHighlightIdx].color.next(this.currHighlightStyle.color);
    this.appConf.highlightStyles[this.currHighlightIdx].wid.next(this.currHighlightStyle.wid);
    this.appConf.highlightStyles[this.currHighlightIdx].name.next(this.currHighlightStyle.name);
    this._c.setAppConfig();
  }

  deleteHighlightStyle() {
    if (this._s.viewUtils.getAllHighlightClasses().length < 2) {
      return;
    }
    this._s.viewUtils.removeHighlightStyle(this.currHighlightIdx);
    this.appConf.highlightStyles.splice(this.currHighlightIdx, 1);
    if (this.currHighlightIdx >= this.appConf.highlightStyles.length) {
      this.currHighlightIdx = this.appConf.highlightStyles.length - 1;
    }
    const curr = this.appConf.highlightStyles[this.currHighlightIdx];
    this.currHighlightStyle = { color: curr.color.getValue(), name: curr.name.getValue(), wid: curr.wid.getValue() };
    this._c.setAppConfig();
  }

  addHighlightStyle() {
    let cyStyle = getCyStyleFromColorAndWid(this.currHighlightStyle.color, this.currHighlightStyle.wid);
    this._s.viewUtils.addHighlightStyle(cyStyle.nodeCss, cyStyle.edgeCss);
    this.appConf.highlightStyles.push({
      wid: new BehaviorSubject<number>(this.currHighlightStyle.wid),
      color: new BehaviorSubject<string>(this.currHighlightStyle.color), name: new BehaviorSubject<string>(this.currHighlightStyle.name)
    });
    this.currHighlightIdx = this.appConf.highlightStyles.length - 1;
    this._c.setAppConfig();
  }

  changeConfig(s: string) {
    this.appConf[s].next(this[s]);
    this._c.setAppConfig();
  }

  changeTigerGraphDbConfigs() {
    for (const key in this.appConf.tigerGraphDbConfig) {
      if (key == 'url' && this.tigerGraphDbConf[key].endsWith('/')) {
        this.tigerGraphDbConf[key] = this.tigerGraphDbConf[key].substring(0, this.tigerGraphDbConf[key].length - 1);
      }
      this.appConf.tigerGraphDbConfig[key].next(this.tigerGraphDbConf[key]);
    }
    this._c.setAppConfig();
  }

  changeNeo4jDbConfigs() {
    for (const key in this.appConf.neo4jDbConfig) {
      this.appConf.neo4jDbConfig[key].next(this.neo4jDbConf[key]);
    }
    this._c.setAppConfig();
  }

}
