import { Component, OnInit, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { SharedService } from '../shared.service';

@Component({
  selector: 'app-object-properties',
  templateUrl: './object-properties.component.html',
  styleUrls: ['./object-properties.component.css']
})
export class ObjectPropertiesComponent implements OnInit {

  @Input() isShow = new Subject<boolean>();
  _isShow = false;
  position = { x: 500, y: 500 };
  keys: string[];
  values: any[];
  currSize: { width: number, height: number } = { width: 375, height: 600 };

  constructor(private _s: SharedService) { }

  ngOnInit(): void {
    this.isShow.subscribe(x => {
      this._isShow = x;
      const d = this._s.cy.$(':selected').data();
      this.keys = Object.keys(d);
      this.values = Object.values(d);
    });
  }

  closeClicked() {
    this.isShow.next(false);
  }

  onMoveEnd(e) {
    this.position = e;
  }

  onResizeStop(e) {
    this.currSize = e.size;
  }

}
