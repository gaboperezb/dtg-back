import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BadgeDetailComponent } from './badge-detail.component';

describe('BadgeDetailComponent', () => {
  let component: BadgeDetailComponent;
  let fixture: ComponentFixture<BadgeDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BadgeDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BadgeDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
