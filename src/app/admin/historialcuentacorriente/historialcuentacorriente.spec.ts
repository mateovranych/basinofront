import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Historialcuentacorriente } from './historialcuentacorriente';

describe('Historialcuentacorriente', () => {
  let component: Historialcuentacorriente;
  let fixture: ComponentFixture<Historialcuentacorriente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Historialcuentacorriente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Historialcuentacorriente);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
