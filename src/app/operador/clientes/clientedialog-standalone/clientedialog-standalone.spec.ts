import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientedialogStandalone } from './clientedialog-standalone';

describe('ClientedialogStandalone', () => {
  let component: ClientedialogStandalone;
  let fixture: ComponentFixture<ClientedialogStandalone>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientedialogStandalone]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientedialogStandalone);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
