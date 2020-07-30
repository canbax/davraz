import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class TigerGraphApiClientService {

  private _token: string = 'flt8i8l4q1lt6isqam4i1lhgq66jthur';
  private _url: string = 'https://socialnet1.i.tgcloud.io';
  private _secret: string = '91rj0k6083a2b6fngp9bo6uuuhmsomdl';

  constructor(private _http: HttpClient, private _settings: SettingsService) { }

  generateToken() {
    this._http.get(this._url + ':9000/requesttoken?secret=' + this._secret, { headers: { 'Access-Control-Allow-Origin': '*' } })
      .subscribe(x => {
        console.log('generate token resp: ', x);
      }, (e) => { console.log('error ', e); });
  }

  simpleRequest() {
    this._http.get(this._url + ':9000/echo',
      { headers: { 'Authorization': 'Bearer flt8i8l4q1lt6isqam4i1lhgq66jthur' } })
      .subscribe(x => {
        console.log('simple request token resp: ', x);
      }, (e) => { console.log('error ', e); });
  }
}
