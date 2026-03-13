import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Facturaciondialog } from './facturaciondialog';

describe('Facturaciondialog', () => {
  let component: Facturaciondialog;
  let fixture: ComponentFixture<Facturaciondialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Facturaciondialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Facturaciondialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
