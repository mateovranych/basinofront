import { TestBed } from '@angular/core/testing';

import { Facturaservice } from './facturaservice';

describe('Facturaservice', () => {
  let service: Facturaservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Facturaservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
