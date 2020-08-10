import { TestBed } from '@angular/core/testing';

import { CyService } from './cy.service';

describe('CyService', () => {
  let service: CyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
