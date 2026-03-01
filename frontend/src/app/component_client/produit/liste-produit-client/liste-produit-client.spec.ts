import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeProduitClient } from './liste-produit-client';

describe('ListeProduitClient', () => {
  let component: ListeProduitClient;
  let fixture: ComponentFixture<ListeProduitClient>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListeProduitClient]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListeProduitClient);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
