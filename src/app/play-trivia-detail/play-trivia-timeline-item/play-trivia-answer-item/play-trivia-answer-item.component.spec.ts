import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayTriviaAnswerItemComponent } from './play-trivia-answer-item.component';

describe('PlayTriviaAnswerItemComponent', () => {
  let component: PlayTriviaAnswerItemComponent;
  let fixture: ComponentFixture<PlayTriviaAnswerItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayTriviaAnswerItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayTriviaAnswerItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
