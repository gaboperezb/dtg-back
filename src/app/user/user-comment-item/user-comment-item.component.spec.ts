import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCommentItemComponent } from './user-comment-item.component';

describe('UserCommentItemComponent', () => {
  let component: UserCommentItemComponent;
  let fixture: ComponentFixture<UserCommentItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserCommentItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserCommentItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
