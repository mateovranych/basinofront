import { TestBed } from '@angular/core/testing';

import { CondicionesIvaService } from './condiciones-iva-service';

describe('CondicionesIvaService', () => {
  let service: CondicionesIvaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CondicionesIvaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
