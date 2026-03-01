import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeBoutiqueAdmin } from './liste-boutique-admin';

describe('ListeBoutiqueAdmin', () => {
  let component: ListeBoutiqueAdmin;
  let fixture: ComponentFixture<ListeBoutiqueAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListeBoutiqueAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListeBoutiqueAdmin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
