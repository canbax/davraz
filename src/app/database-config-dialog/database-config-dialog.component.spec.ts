import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatabaseConfigDialogComponent } from './database-config-dialog.component';

describe('DatabaseConfigDialogComponent', () => {
  let component: DatabaseConfigDialogComponent;
  let fixture: ComponentFixture<DatabaseConfigDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatabaseConfigDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatabaseConfigDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
