import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProvinciasDialog } from './provincias-dialog';

describe('ProvinciasDialog', () => {
  let component: ProvinciasDialog;
  let fixture: ComponentFixture<ProvinciasDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProvinciasDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProvinciasDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
