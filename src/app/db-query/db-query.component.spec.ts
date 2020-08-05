import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DbQueryComponent } from './db-query.component';

describe('DbQueryComponent', () => {
  let component: DbQueryComponent;
  let fixture: ComponentFixture<DbQueryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DbQueryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DbQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
