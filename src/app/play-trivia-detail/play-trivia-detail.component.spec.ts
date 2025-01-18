import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayTriviaDetailComponent } from './play-trivia-detail.component';

describe('PlayTriviaDetailComponent', () => {
  let component: PlayTriviaDetailComponent;
  let fixture: ComponentFixture<PlayTriviaDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayTriviaDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayTriviaDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
