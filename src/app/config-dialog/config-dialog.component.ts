import { Component } from '@angular/core';
import { TigerGraphApiClientService } from '../tiger-graph-api-client.service';
import { TigerGraphDbConfig, AppConfig } from '../data-types';
import { SettingsService } from '../settings.service';
import { getCyStyleFromColorAndWid, Layout } from '../constants';
import { SharedService } from '../shared.service';
import { BehaviorSubject } from 'rxjs';
import { MatChipInputEvent } from '@angular/material/chips';

@Component({
  selector: 'app-config-dialog',
  templateUrl: './config-dialog.component.html',
  styleUrls: ['./config-dialog.component.css']
})
export class ConfigDialogComponent {

  dbConf: TigerGraphDbConfig = { password: '', secret: '', token: '', tokenExpire: 0, url: '', username: '', graphName: '' };
  tokenExpireDateStr = '';
  appConf: AppConfig;
  currHighlightStyle: { wid: number, color: string, name: string };
  currHighlightIdx: number;
  isIgnoreCaseInText: boolean;
  sampleDataNodeCount: number;
  server: string;
  sampleDataEdgeCount: number;
  layoutOptions: string[];
  currLayout: string;
  nodeTypes: string[] = [];

  constructor(private _s: SharedService, private _tgApi: TigerGraphApiClientService, private _settings: SettingsService) {
    this.syncDbConfig();
    this.syncAppConfig();
    this.layoutOptions = Object.keys(Layout);
  }

  saveDbConfig() {
    this._tgApi.setConfig(this.dbConf, null);
    this.changeConfig('server');
  }

  refreshDbToken() {
    this._tgApi.refreshToken(this.dbConf.secret, (x) => {
      this.dbConf.tokenExpire = x.expiration;
      this.dbConf.token = x.token;
      this._tgApi.setConfig(this.dbConf, this.syncDbConfig.bind(this));
    });
  }

  private syncAppConfig() {
    this.appConf = this._s.appConf;
    this.currHighlightIdx = this.appConf.currHighlightIdx.getValue();
    const curr = this.appConf.highlightStyles[this.currHighlightIdx];
    this.currHighlightStyle = { color: curr.color.getValue(), name: curr.name.getValue(), wid: curr.wid.getValue() };
    this.isIgnoreCaseInText = this.appConf.isIgnoreCaseInText.getValue();
    this.sampleDataNodeCount = this.appConf.sampleDataNodeCount.getValue();
    this.sampleDataEdgeCount = this.appConf.sampleDataEdgeCount.getValue();
    this.currLayout = this.appConf.currLayout.getValue();
    this.server = this.appConf.server.getValue();
    this.nodeTypes = this.appConf.nodeTypes.map(x => x.getValue());
  }

  private syncDbConfig() {
    this._tgApi.getConfig(dbConf => {
      this.dbConf.url = dbConf.url;
      this.dbConf.secret = dbConf.secret;
      this.dbConf.username = dbConf.username;
      this.dbConf.password = dbConf.password;
      this.dbConf.token = dbConf.token;
      this.dbConf.tokenExpire = dbConf.tokenExpire;
      this.dbConf.graphName = dbConf.graphName;
      this.tokenExpireDateStr = new Date(this.dbConf.tokenExpire * 1000).toDateString();
    });
  }

  changeCurrHiglightStyle() {
    const curr = this.appConf.highlightStyles[this.currHighlightIdx];
    this.appConf.currHighlightIdx.next(this.currHighlightIdx);
    this.currHighlightStyle.color = curr.color.getValue();
    this.currHighlightStyle.name = curr.name.getValue();
    this.currHighlightStyle.wid = curr.wid.getValue();
    this._settings.setAppConfig(this.appConf);
  }

  changeHighlightStyle() {
    let cyStyle = getCyStyleFromColorAndWid(this.currHighlightStyle.color, this.currHighlightStyle.wid);
    this._s.viewUtils.changeHighlightStyle(this.currHighlightIdx, cyStyle.nodeCss, cyStyle.edgeCss);

    this.appConf.highlightStyles[this.currHighlightIdx].color.next(this.currHighlightStyle.color);
    this.appConf.highlightStyles[this.currHighlightIdx].wid.next(this.currHighlightStyle.wid);
    this.appConf.highlightStyles[this.currHighlightIdx].name.next(this.currHighlightStyle.name);
    this._settings.setAppConfig(this.appConf);
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
    this._settings.setAppConfig(this.appConf);
  }

  addHighlightStyle() {
    let cyStyle = getCyStyleFromColorAndWid(this.currHighlightStyle.color, this.currHighlightStyle.wid);
    this._s.viewUtils.addHighlightStyle(cyStyle.nodeCss, cyStyle.edgeCss);
    this.appConf.highlightStyles.push({
      wid: new BehaviorSubject<number>(this.currHighlightStyle.wid),
      color: new BehaviorSubject<string>(this.currHighlightStyle.color), name: new BehaviorSubject<string>(this.currHighlightStyle.name)
    });
    this.currHighlightIdx = this.appConf.highlightStyles.length - 1;
    this._settings.setAppConfig(this.appConf);
  }

  changeConfig(s: string) {
    this.appConf[s].next(this[s]);
    this._settings.setAppConfig(this.appConf);
  }

  addNodeType(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our fruit
    if ((value || '').trim()) {
      const v = value.trim();
      this.nodeTypes.push(v);
      this.appConf.nodeTypes.push(new BehaviorSubject<string>(v));
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
    this._settings.setAppConfig(this.appConf);
  }

  removeNodeType(e) {
    console.log('remove node type: ', e);
    const index = this.nodeTypes.indexOf(e);
    if (index >= 0) {
      this.nodeTypes.splice(index, 1);
      this.appConf.nodeTypes.splice(index, 1);
    }
    this._settings.setAppConfig(this.appConf);
  }

}
