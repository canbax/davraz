import { Injectable } from '@angular/core';
import { InterprettedQueryResult } from './data-types';
import { SharedService } from './shared.service';

@Injectable({
  providedIn: 'root'
})
export class CyService {

  constructor(private _s: SharedService) { }

  loadGraph(data: InterprettedQueryResult) {
    // this._s.cy
    if (data.error) {
      console.log('error in data of query result: ', data.error);
      return;
    }
    console.log('data: ', data);
  }
}
