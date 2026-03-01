import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PorteFeuilleBoutique } from './porte-feuille-boutique';

describe('PorteFeuilleBoutique', () => {
  let component: PorteFeuilleBoutique;
  let fixture: ComponentFixture<PorteFeuilleBoutique>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PorteFeuilleBoutique]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PorteFeuilleBoutique);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
