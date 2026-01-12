import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Localidades } from './localidades';

describe('Localidades', () => {
  let component: Localidades;
  let fixture: ComponentFixture<Localidades>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Localidades]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Localidades);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
