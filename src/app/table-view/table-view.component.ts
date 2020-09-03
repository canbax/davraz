import { AfterViewInit, Component, ViewChild, Input } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { SharedService } from '../shared.service';

@Component({
  selector: 'app-table-view',
  templateUrl: './table-view.component.html',
  styleUrls: ['./table-view.component.css']
})
export class TableViewComponent implements AfterViewInit {
  columns: string[];
  data: any[];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<any>;

  constructor(private _s: SharedService) {
    // Assign the data to the data source for the table to render
    this.dataSource = new MatTableDataSource(this.data);
  }

  ngAfterViewInit() {
    this._s.tableData.subscribe(x => {
      this.dataSource = new MatTableDataSource(x.data);
      this.columns = x.columns;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.table.renderRows();
    })
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
}