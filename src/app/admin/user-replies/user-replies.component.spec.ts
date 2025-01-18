import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserRepliesComponent } from './user-replies.component';

describe('UserRepliesComponent', () => {
  let component: UserRepliesComponent;
  let fixture: ComponentFixture<UserRepliesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserRepliesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserRepliesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
