import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjectPropertiesComponent } from './object-properties.component';

describe('ObjectPropertiesComponent', () => {
  let component: ObjectPropertiesComponent;
  let fixture: ComponentFixture<ObjectPropertiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ObjectPropertiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjectPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
