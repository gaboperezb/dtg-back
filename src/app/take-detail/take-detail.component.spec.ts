import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TakeDetailComponent } from './take-detail.component';

describe('TakeDetailComponent', () => {
  let component: TakeDetailComponent;
  let fixture: ComponentFixture<TakeDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TakeDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TakeDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
