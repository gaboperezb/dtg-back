import { Injectable, Renderer2, RendererFactory2, Inject } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';



@Injectable({
    providedIn: 'root'
})
export class StateService {

    renderer: any;

    constructor(private rendererFactory: RendererFactory2, @Inject(PLATFORM_ID) private platformId: Object) {
        this.renderer = rendererFactory.createRenderer(null, null);
     }

    freezeBody() {

        if (isPlatformBrowser(this.platformId)) {
            this.renderer.addClass(document.body, 'modal-open');
        }
       
    }

    unfreezeBody() {
        if (isPlatformBrowser(this.platformId)) {
            this.renderer.removeClass(document.body, 'modal-open');
         }
       
    }


}