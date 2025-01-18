import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TakeTimelineItemComponent } from './take-timeline-item.component';

describe('TakeTimelineDetailComponent', () => {
  let component: TakeTimelineItemComponent;
  let fixture: ComponentFixture<TakeTimelineItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TakeTimelineItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TakeTimelineItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
