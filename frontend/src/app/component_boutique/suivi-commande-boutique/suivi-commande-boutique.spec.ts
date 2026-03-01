import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuiviCommandeBoutique } from './suivi-commande-boutique';

describe('SuiviCommandeBoutique', () => {
  let component: SuiviCommandeBoutique;
  let fixture: ComponentFixture<SuiviCommandeBoutique>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuiviCommandeBoutique]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuiviCommandeBoutique);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
