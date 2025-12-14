import { TestBed } from '@angular/core/testing';

import { PrecioConfiguracionesService } from './precio-configuraciones-service';

describe('PrecioConfiguracionesService', () => {
  let service: PrecioConfiguracionesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrecioConfiguracionesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
