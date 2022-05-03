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
  isFullView = false;
  prevPosition = { top: '0px', left: '0px' };
  currSize: { width: string, height: string } = { width: '500px', height: '600px' };
  prevSize: { width: string, height: string } = { width: '500px', height: '600px' };
  isNewlyMinized = false;
  readonly maxWid = (window.innerWidth - 20) + 'px';
  readonly maxHei = (window.innerHeight - 20) + 'px';

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
    });
  }

  onMouseDownOnHandle() {
    // lower all the draggable divs on z-index
    const draggableDivs = document.getElementsByClassName('draggable-content');
    for (let i = 0; i < draggableDivs.length; i++) {
      (draggableDivs[i] as HTMLElement).style.zIndex = '1001';
    }
    this.mainElem.nativeElement.style.zIndex = '1002';
  }

  closeClicked() {
    this.isShow.next(false);
  }

  openInFull() {
    if (!this.isNewlyMinized) {
      this.saveCurrentState();
    } else {
      this.isNewlyMinized = false;
    }

    this.currSize.width = this.maxWid;
    this.currSize.height = this.maxHei;
    this.position.top = '10px';
    this.position.left = '10px';
    this.setMainElemStyle();
    this.isFullView = true;
  }

  minimize() {
    this.isNewlyMinized = true;
    this.isFullView = false;
    this.position.top = (window.innerHeight - 50) + 'px';
    this.position.left = '10px';
    this.currSize.width = '50px';
    this.currSize.height = '40px';
    this.setMainElemStyle();
  }

  restorePrevState() {
    this.isFullView = false;
    this.position.left = this.prevPosition.left;
    this.position.top = this.prevPosition.top;
    this.currSize.height = this.prevSize.height;
    this.currSize.width = this.prevSize.width;
    this.setMainElemStyle();
  }

  private saveCurrentState() {
    this.prevPosition.top = this.mainElem.nativeElement.style.top;
    this.prevPosition.left = this.mainElem.nativeElement.style.left;
    this.prevSize.width = this.mainElem.nativeElement.style.width;
    this.prevSize.height = this.mainElem.nativeElement.style.height;
  }

  private setMainElemStyle() {
    this.mainElem.nativeElement.style.top = this.position.top;
    this.mainElem.nativeElement.style.left = this.position.left;
    this.mainElem.nativeElement.style.width = this.currSize.width;
    this.mainElem.nativeElement.style.height = this.currSize.height;
  }

}
