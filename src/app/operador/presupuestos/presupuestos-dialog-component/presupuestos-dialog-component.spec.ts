import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresupuestosDialogComponent } from './presupuestos-dialog-component';

describe('PresupuestosDialogComponent', () => {
  let component: PresupuestosDialogComponent;
  let fixture: ComponentFixture<PresupuestosDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PresupuestosDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PresupuestosDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
