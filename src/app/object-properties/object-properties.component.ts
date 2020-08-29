import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { SharedService } from '../shared.service';
import { makeElemDraggable } from '../constants';

@Component({
  selector: 'app-object-properties',
  templateUrl: './object-properties.component.html',
  styleUrls: ['./object-properties.component.css']
})
export class ObjectPropertiesComponent implements OnInit {

  @Input() isShow = new Subject<boolean>();
  @ViewChild('mainElem', { static: false }) mainElem;
  @ViewChild('moverElem', { static: false }) moverElem;
  _isShow = false;
  position = { x: 500, y: 500 };
  keys: string[];
  values: any[];
  currSize: { width: number, height: number } = { width: 375, height: 600 };
  classes: string;
  container: any;

  constructor(private _s: SharedService) {
    this.container = document.getElementsByClassName('container')[0];

  }

  ngOnInit(): void {

    this.isShow.subscribe(x => {
      this._isShow = x;
      const d = this._s.cy.$(':selected').data();
      if (!d || !x) {
        return;
      }

      if (this.position.y < 0) {
        this.position.y = 0;
      }
      this.keys = Object.keys(d);
      this.values = Object.values(d);
      this.classes = this._s.cy.$(':selected').classes();
      console.log('pos: ', this.position);
      setTimeout(() => {
        makeElemDraggable(this.mainElem.nativeElement, this.moverElem.nativeElement);
      }, 0);
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
