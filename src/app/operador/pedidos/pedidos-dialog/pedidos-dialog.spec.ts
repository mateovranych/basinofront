import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PedidosDialog } from './pedidos-dialog';

describe('PedidosDialog', () => {
  let component: PedidosDialog;
  let fixture: ComponentFixture<PedidosDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PedidosDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PedidosDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
