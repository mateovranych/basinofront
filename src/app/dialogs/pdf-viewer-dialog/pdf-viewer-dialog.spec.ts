import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfViewerDialog } from './pdf-viewer-dialog';

describe('PdfViewerDialog', () => {
  let component: PdfViewerDialog;
  let fixture: ComponentFixture<PdfViewerDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdfViewerDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PdfViewerDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
