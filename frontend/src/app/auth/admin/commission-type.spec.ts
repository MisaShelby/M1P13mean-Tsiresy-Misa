import { TestBed } from '@angular/core/testing';

import { CommissionType } from './commission-type.service';

describe('CommissionType', () => {
  let service: CommissionType;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommissionType);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
