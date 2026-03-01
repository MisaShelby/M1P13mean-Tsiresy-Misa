import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListePanier } from './liste-panier';

describe('ListePanier', () => {
  let component: ListePanier;
  let fixture: ComponentFixture<ListePanier>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListePanier]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListePanier);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
