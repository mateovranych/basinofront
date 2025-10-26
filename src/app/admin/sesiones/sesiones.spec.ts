import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sesiones } from './sesiones';

describe('Sesiones', () => {
  let component: Sesiones;
  let fixture: ComponentFixture<Sesiones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sesiones]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Sesiones);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
