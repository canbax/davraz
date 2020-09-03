import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DraggableDivComponent } from './draggable-div.component';

describe('DraggableDivComponent', () => {
  let component: DraggableDivComponent;
  let fixture: ComponentFixture<DraggableDivComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DraggableDivComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DraggableDivComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
