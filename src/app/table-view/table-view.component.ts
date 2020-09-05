import { AfterViewInit, Component, ViewChild, Input, OnDestroy } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { SharedService } from '../shared.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-table-view',
  templateUrl: './table-view.component.html',
  styleUrls: ['./table-view.component.css']
})
export class TableViewComponent implements AfterViewInit, OnDestroy {
  columns: string[];
  data: any[];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<any>;
  subscription: Subscription;
  subscription2: Subscription;
  hoveredIdx = -1;

  constructor(private _s: SharedService) {
    // Assign the data to the data source for the table to render
    this.dataSource = new MatTableDataSource(this.data);
    this.subscription = this._s.tableData.subscribe(x => {
      this.dataSource.data = x.data;
      this.columns = x.columns;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.table.renderRows();
    });
    this.subscription2 = this._s.elemHoverChanged.subscribe(e => {
      if (e.type == 'mouseover') {
        this.setHoveredIdxFromElem(e);
      } else {
        this.hoveredIdx = -1;
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.subscription2.unsubscribe();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onMouseEnter(row) {
    const id = this.getIdOfElement(row);
    this._s.cy.$id(id).addClass('hover');
  }

  onMouseExit(row) {
    const id = this.getIdOfElement(row);
    this._s.cy.$id(id).removeClass('hover');
  }

  private getIdOfElement(row) {
    if (row.properties && typeof row.properties === 'string') {
      return JSON.parse(row.properties).id;
    }
    return row.id;
  }

  private setHoveredIdxFromElem(e) {
    if (!e || !e.target) {
      return;
    }
    const id = e.target.id();
    if (!id || !this.dataSource || !this.dataSource.data) {
      return;
    }
    let idx = 0;
    for (const d of this.dataSource.data) {
      if (d.properties && typeof d.properties === 'string') {
        const curr = JSON.parse(d.properties).id;
        if (curr == id) {
          this.hoveredIdx = idx;
          return;
        }
      } else {
        if (d.id == id) {
          this.hoveredIdx = idx;
          return;
        }
      }
      idx++;
    }

    this.hoveredIdx = -1;
  }
}