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
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { AppComponent } from './app.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ConfigDialogComponent } from './config-dialog/config-dialog.component';
import { DbQueryComponent } from './db-query/db-query.component';
import { ErrorDialogComponent } from './error-dialog/error-dialog.component';
import { SavePngDialogComponent } from './save-png-dialog/save-png-dialog.component';
import { ObjectPropertiesComponent } from './object-properties/object-properties.component';

@NgModule({
  declarations: [
    AppComponent,
    ConfigDialogComponent,
    DbQueryComponent,
    ErrorDialogComponent,
    SavePngDialogComponent,
    ObjectPropertiesComponent
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
    AngularDraggableModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
