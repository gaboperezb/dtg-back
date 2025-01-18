import { async, TestBed } from '@angular/core/testing';
import { TakeAnswerItemComponent } from './take-answer-item.component';
describe('TakeAnswerItemComponent', () => {
    let component;
    let fixture;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TakeAnswerItemComponent]
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
//# sourceMappingURL=take-answer-item.component.spec.js.map