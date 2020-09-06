import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { makeElemDraggable } from '../constants';

@Component({
  selector: 'app-draggable-div',
  templateUrl: './draggable-div.component.html',
  styleUrls: ['./draggable-div.component.css']
})
export class DraggableDivComponent implements OnInit {

  @Input() component: any;
  @Input() header: string;
  @Input() isShow = new Subject<boolean>();
  @ViewChild('mainElem', { static: false }) mainElem;
  @ViewChild('moverElem', { static: false }) moverElem;
  _isShow = false;
  position = { top: '0px', left: '0px' };
  currSize: { width: string, height: string } = { width: '500px', height: '600px' };

  constructor() { }

  ngOnInit(): void {
    this.isShow.subscribe(x => {
      this._isShow = x;
      if (!x) {
        this.position.top = this.mainElem.nativeElement.style.top;
        this.position.left = this.mainElem.nativeElement.style.left;
        this.currSize.width = this.mainElem.nativeElement.style.width;
        this.currSize.height = this.mainElem.nativeElement.style.height;
      }
      if (x) {
        setTimeout(() => {
          makeElemDraggable(this.mainElem.nativeElement, this.moverElem.nativeElement);
        }, 0);
      }
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
