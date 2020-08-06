import { Component, OnInit, Input } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-db-query',
  templateUrl: './db-query.component.html',
  styleUrls: ['./db-query.component.css']
})
export class DbQueryComponent implements OnInit {

  @Input() isShow = new Subject<boolean>();
  _isShow = false;
  position = { x: 500, y: 500 };
  currSize: { width: number, height: number } = { width: 375, height: 600 };
  activeItemIdx = 0;

  constructor() {

  }

  ngOnInit(): void {
    this.isShow.subscribe(x => { console.log('is show in db-query ', x); this._isShow = x; });
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
