import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockProduit } from './stock-produit';

describe('StockProduit', () => {
  let component: StockProduit;
  let fixture: ComponentFixture<StockProduit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockProduit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockProduit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
