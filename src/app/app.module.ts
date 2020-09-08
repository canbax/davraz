import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDividerModule } from '@angular/material/divider';

import { AppComponent } from './app.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ConfigDialogComponent } from './config-dialog/config-dialog.component';
import { DbQueryComponent } from './db-query/db-query.component';
import { ErrorDialogComponent } from './error-dialog/error-dialog.component';
import { SavePngDialogComponent } from './save-png-dialog/save-png-dialog.component';
import { ObjectPropertiesComponent } from './object-properties/object-properties.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TableViewComponent } from './table-view/table-view.component';
import { DraggableDivComponent } from './draggable-div/draggable-div.component';
import { GraphHistoryComponent } from './graph-history/graph-history.component';

@NgModule({
  declarations: [
    AppComponent,
    ConfigDialogComponent,
    DbQueryComponent,
    ErrorDialogComponent,
    SavePngDialogComponent,
    ObjectPropertiesComponent,
    TableViewComponent,
    DraggableDivComponent,
    GraphHistoryComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    NoopAnimationsModule,
    MatToolbarModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatDialogModule,
    MatInputModule,
    MatCardModule,
    FormsModule,
    MatRadioModule,
    MatSelectModule,
    MatExpansionModule,
    MatChipsModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    BrowserAnimationsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDividerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
