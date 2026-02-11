import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InscriptionAdmin } from './inscription_admin';

describe('InscriptionAdmin', () => {
  let component: InscriptionAdmin;
  let fixture: ComponentFixture<InscriptionAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InscriptionAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InscriptionAdmin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
