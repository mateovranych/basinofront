import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Presupuestospdfdialog } from './presupuestospdfdialog';

describe('Presupuestospdfdialog', () => {
  let component: Presupuestospdfdialog;
  let fixture: ComponentFixture<Presupuestospdfdialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Presupuestospdfdialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Presupuestospdfdialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
