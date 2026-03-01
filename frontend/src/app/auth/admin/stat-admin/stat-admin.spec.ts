import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatAdmin } from './stat-admin';

describe('StatAdmin', () => {
  let component: StatAdmin;
  let fixture: ComponentFixture<StatAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatAdmin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
