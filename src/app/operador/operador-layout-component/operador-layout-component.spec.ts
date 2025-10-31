import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperadorLayoutComponent } from './operador-layout-component';

describe('OperadorLayoutComponent', () => {
  let component: OperadorLayoutComponent;
  let fixture: ComponentFixture<OperadorLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperadorLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OperadorLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
