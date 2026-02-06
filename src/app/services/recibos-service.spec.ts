import { TestBed } from '@angular/core/testing';

import { RecibosService } from './recibos-service';

describe('RecibosService', () => {
  let service: RecibosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecibosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
