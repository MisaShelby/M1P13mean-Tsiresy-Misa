import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidationInscriBoutique } from './validation-inscri-boutique';

describe('ValidationInscriBoutique', () => {
  let component: ValidationInscriBoutique;
  let fixture: ComponentFixture<ValidationInscriBoutique>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidationInscriBoutique]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValidationInscriBoutique);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
