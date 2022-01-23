import { TestBed } from '@angular/core/testing';

import { LogHttpCallsService } from './log-http-calls.service';

describe('LogHttpCallsService', () => {
  let service: LogHttpCallsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LogHttpCallsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
