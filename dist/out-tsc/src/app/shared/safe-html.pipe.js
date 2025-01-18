import { __decorate } from "tslib";
import { Pipe } from '@angular/core';
/**
 * Generated class for the SafeHtmlPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
let SafeHtmlPipe = class SafeHtmlPipe {
    constructor(sanitizer) {
        this.sanitizer = sanitizer;
    }
    transform(html) {
        return this.sanitizer.bypassSecurityTrustHtml(html);
    }
};
SafeHtmlPipe = __decorate([
    Pipe({
        name: 'safeHtml',
    })
], SafeHtmlPipe);
export { SafeHtmlPipe };
//# sourceMappingURL=safe-html.pipe.js.map