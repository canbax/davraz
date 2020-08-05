import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-db-query',
  templateUrl: './db-query.component.html',
  styleUrls: ['./db-query.component.css']
})
export class DbQueryComponent implements OnInit {

  @Input() isShow: boolean = false;
  position = { x: 500, y: 500 };
  currSize: { width: number, height: number } = { width: 375, height: 600 };
  activeItemIdx = 0;

  constructor() { }

  ngOnInit(): void {
    
  }
  
  closeClicked() {
    this.isShow = false;
  }

  onMoveEnd(e) {
    this.position = e;
  }

  onResizeStop(e) {
    this.currSize = e.size;
  }

}
