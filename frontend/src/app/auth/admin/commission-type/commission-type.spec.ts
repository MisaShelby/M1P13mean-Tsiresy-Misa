import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommissionType } from './commission-type.component';

describe('CommissionType', () => {
  let component: CommissionType;
  let fixture: ComponentFixture<CommissionType>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommissionType]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommissionType);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
