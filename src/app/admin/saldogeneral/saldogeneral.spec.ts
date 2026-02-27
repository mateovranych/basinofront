import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Saldogeneral } from './saldogeneral';

describe('Saldogeneral', () => {
  let component: Saldogeneral;
  let fixture: ComponentFixture<Saldogeneral>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Saldogeneral]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Saldogeneral);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
