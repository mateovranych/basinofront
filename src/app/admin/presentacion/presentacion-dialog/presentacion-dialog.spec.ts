import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresentacionDialog } from './presentacion-dialog';

describe('PresentacionDialog', () => {
  let component: PresentacionDialog;
  let fixture: ComponentFixture<PresentacionDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PresentacionDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PresentacionDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
