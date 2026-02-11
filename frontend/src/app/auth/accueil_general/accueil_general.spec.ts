import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccueilGeneral } from './accueil_general';

describe('AccueilGeneral', () => {
  let component: AccueilGeneral;
  let fixture: ComponentFixture<AccueilGeneral>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccueilGeneral]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccueilGeneral);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
