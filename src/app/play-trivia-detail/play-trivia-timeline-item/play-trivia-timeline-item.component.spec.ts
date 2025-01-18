import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayTriviaTimelineItemComponent } from './play-trivia-timeline-item.component';

describe('PlayTriviaTimelineItemComponent', () => {
  let component: PlayTriviaTimelineItemComponent;
  let fixture: ComponentFixture<PlayTriviaTimelineItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayTriviaTimelineItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayTriviaTimelineItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
