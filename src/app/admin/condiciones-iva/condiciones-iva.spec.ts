import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CondicionesIva } from './condiciones-iva';

describe('CondicionesIva', () => {
  let component: CondicionesIva;
  let fixture: ComponentFixture<CondicionesIva>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CondicionesIva]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CondicionesIva);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
