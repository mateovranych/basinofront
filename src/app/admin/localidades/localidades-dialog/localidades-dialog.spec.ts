import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalidadesDialog } from './localidades-dialog';

describe('LocalidadesDialog', () => {
  let component: LocalidadesDialog;
  let fixture: ComponentFixture<LocalidadesDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocalidadesDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LocalidadesDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
