import { TestBed } from '@angular/core/testing';

import { AppConfService } from './app-conf.service';

describe('AppConfService', () => {
  let service: AppConfService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppConfService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
