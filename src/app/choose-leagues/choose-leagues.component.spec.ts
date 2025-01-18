import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseLeaguesComponent } from './choose-leagues.component';

describe('ChooseLeaguesComponent', () => {
  let component: ChooseLeaguesComponent;
  let fixture: ComponentFixture<ChooseLeaguesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChooseLeaguesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChooseLeaguesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
