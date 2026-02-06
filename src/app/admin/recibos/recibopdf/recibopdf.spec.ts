import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Recibopdf } from './recibopdf';

describe('Recibopdf', () => {
  let component: Recibopdf;
  let fixture: ComponentFixture<Recibopdf>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Recibopdf]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Recibopdf);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
