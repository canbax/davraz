import { Injectable } from '@angular/core';
import { AppConfig } from './data-types';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AppConfService {
  public appConf: AppConfig;

  constructor(private _settings: LocalStorageService) {
    this.appConf = this._settings.getAppConfig();
  }

  public setAppConfig() {
    this._settings.setAppConfig(this.appConf);
  }

  getConfAsJSON(): any {
    return this._settings.appConf2Json(this.appConf);
  }

}
