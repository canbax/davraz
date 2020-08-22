import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SavePngDialogComponent } from './save-png-dialog.component';

describe('SavePngDialogComponent', () => {
  let component: SavePngDialogComponent;
  let fixture: ComponentFixture<SavePngDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SavePngDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SavePngDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
