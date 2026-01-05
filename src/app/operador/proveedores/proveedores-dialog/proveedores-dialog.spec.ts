import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProveedoresDialog } from './proveedores-dialog';

describe('ProveedoresDialog', () => {
  let component: ProveedoresDialog;
  let fixture: ComponentFixture<ProveedoresDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProveedoresDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProveedoresDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
