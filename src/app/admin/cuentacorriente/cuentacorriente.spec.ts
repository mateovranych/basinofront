import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cuentacorriente } from './cuentacorriente';

describe('Cuentacorriente', () => {
  let component: Cuentacorriente;
  let fixture: ComponentFixture<Cuentacorriente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cuentacorriente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cuentacorriente);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
