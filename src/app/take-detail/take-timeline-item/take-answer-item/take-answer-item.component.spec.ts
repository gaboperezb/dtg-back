import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TakeAnswerItemComponent } from './take-answer-item.component';

describe('TakeAnswerItemComponent', () => {
  let component: TakeAnswerItemComponent;
  let fixture: ComponentFixture<TakeAnswerItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TakeAnswerItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TakeAnswerItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
