import { TestBed } from '@angular/core/testing';

import { Neo4jApiClientService } from './neo4j-api-client.service';

describe('Neo4jApiClientService', () => {
  let service: Neo4jApiClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Neo4jApiClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
