import { TestBed } from '@angular/core/testing';

import { DbClientService } from './db-client.service';

describe('DbClientService', () => {
  let service: DbClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DbClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
