import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PwdForgotComponent } from './pwd-forgot.component';

describe('PwdForgotComponent', () => {
  let component: PwdForgotComponent;
  let fixture: ComponentFixture<PwdForgotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PwdForgotComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PwdForgotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
