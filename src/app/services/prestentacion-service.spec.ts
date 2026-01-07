import { TestBed } from '@angular/core/testing';

import { PrestentacionService } from './prestentacion-service';

describe('PrestentacionService', () => {
  let service: PrestentacionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrestentacionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
