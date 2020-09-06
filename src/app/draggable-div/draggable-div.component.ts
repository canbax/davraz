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
      } else {
        setTimeout(() => {
          this.setMainElemStyle();
        }, 0);
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

  openInFull() {
    this.currSize.width = (window.innerWidth - 20) + 'px';
    this.currSize.height = (window.innerHeight - 20) + 'px';
    this.position.top = '10px';
    this.position.left = '10px';
    this.setMainElemStyle();
  }

  minimize() {
    this.position.top = (window.innerHeight - 50) + 'px';
    this.position.left = '10px';
    this.currSize.width = '50px';
    this.currSize.height = '40px';
    this.setMainElemStyle();
  }

  private setMainElemStyle() {
    this.mainElem.nativeElement.style.top = this.position.top;
    this.mainElem.nativeElement.style.left = this.position.left;
    this.mainElem.nativeElement.style.width = this.currSize.width;
    this.mainElem.nativeElement.style.height = this.currSize.height;
  }

}
