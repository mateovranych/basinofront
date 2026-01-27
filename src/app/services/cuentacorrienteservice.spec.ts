import { TestBed } from '@angular/core/testing';

import { Cuentacorrienteservice } from './cuentacorrienteservice';

describe('Cuentacorrienteservice', () => {
  let service: Cuentacorrienteservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Cuentacorrienteservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
