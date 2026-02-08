import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Historialcc } from './historialcc';

describe('Historialcc', () => {
  let component: Historialcc;
  let fixture: ComponentFixture<Historialcc>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Historialcc]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Historialcc);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
