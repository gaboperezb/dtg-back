import { async, TestBed } from '@angular/core/testing';
import { PwdForgotComponent } from './pwd-forgot.component';
describe('PwdForgotComponent', () => {
    let component;
    let fixture;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [PwdForgotComponent]
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
//# sourceMappingURL=pwd-forgot.component.spec.js.map