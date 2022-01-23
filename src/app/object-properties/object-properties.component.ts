import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SharedService } from '../shared.service';
import { debounce, OBJ_INFO_UPDATE_DELAY } from '../constants';

@Component({
  selector: 'app-object-properties',
  templateUrl: './object-properties.component.html',
  styleUrls: ['./object-properties.component.css']
})
export class ObjectPropertiesComponent implements OnInit, OnDestroy {

  keys: string[];
  values: any[];
  subscription: Subscription;

  constructor(private _s: SharedService) {
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    const fn = debounce(this.showObjProps, OBJ_INFO_UPDATE_DELAY).bind(this)
    this.subscription = this._s.elemSelectChanged.subscribe(fn);
    this.showObjProps();
  }

  showObjProps() {
    const d = this._s.cy.$(':selected').data();
    if (!d) {
      return;
    }
    this.keys = Object.keys(d);
    this.values = Object.values(d);
  }
}
