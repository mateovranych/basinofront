import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CondicionesIvaDialog } from './condiciones-iva-dialog';

describe('CondicionesIvaDialog', () => {
  let component: CondicionesIvaDialog;
  let fixture: ComponentFixture<CondicionesIvaDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CondicionesIvaDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CondicionesIvaDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
