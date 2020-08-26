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
import { AngularDraggableModule } from 'angular2-draggable';
import { MatSelectModule } from '@angular/material/select';

import { AppComponent } from './app.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DatabaseConfigDialogComponent } from './database-config-dialog/database-config-dialog.component';
import { DbQueryComponent } from './db-query/db-query.component';
import { SampleDataDialogComponent } from './sample-data-dialog/sample-data-dialog.component';
import { ErrorDialogComponent } from './error-dialog/error-dialog.component';
import { SavePngDialogComponent } from './save-png-dialog/save-png-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    DatabaseConfigDialogComponent,
    DbQueryComponent,
    SampleDataDialogComponent,
    ErrorDialogComponent,
    SavePngDialogComponent
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
    AngularDraggableModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
