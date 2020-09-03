import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { SharedService } from '../shared.service';
import { makeElemDraggable, debounce, OBJ_INFO_UPDATE_DELAY } from '../constants';

@Component({
  selector: 'app-object-properties',
  templateUrl: './object-properties.component.html',
  styleUrls: ['./object-properties.component.css']
})
export class ObjectPropertiesComponent implements OnInit {

  keys: string[];
  values: any[];

  constructor(private _s: SharedService) {
  }

  ngOnInit(): void {
    const fn = debounce(this.showObjProps, OBJ_INFO_UPDATE_DELAY).bind(this)
    this._s.elemSelectChanged.subscribe(fn);
  }

  showObjProps() {
    const d = this._s.cy.$(':selected').data();
    this.keys = Object.keys(d);
    this.values = Object.values(d);
  }
}
