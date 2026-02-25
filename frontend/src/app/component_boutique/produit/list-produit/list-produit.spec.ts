import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListProduit } from './list-produit';

describe('ListProduit', () => {
  let component: ListProduit;
  let fixture: ComponentFixture<ListProduit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListProduit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListProduit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
