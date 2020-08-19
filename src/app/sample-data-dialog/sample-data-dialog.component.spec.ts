import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SampleDataDialogComponent } from './sample-data-dialog.component';

describe('SampleDataDialogComponent', () => {
  let component: SampleDataDialogComponent;
  let fixture: ComponentFixture<SampleDataDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SampleDataDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SampleDataDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
