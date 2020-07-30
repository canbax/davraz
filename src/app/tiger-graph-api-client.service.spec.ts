import { TestBed } from '@angular/core/testing';

import { TigerGraphApiClientService } from './tiger-graph-api-client.service';

describe('TigerGraphApiClientService', () => {
  let service: TigerGraphApiClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TigerGraphApiClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
