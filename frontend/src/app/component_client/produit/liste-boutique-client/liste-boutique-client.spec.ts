import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeBoutiqueClient } from './liste-boutique-client';

describe('ListeBoutiqueClient', () => {
  let component: ListeBoutiqueClient;
  let fixture: ComponentFixture<ListeBoutiqueClient>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListeBoutiqueClient]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListeBoutiqueClient);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
