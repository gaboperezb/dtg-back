import { Component, OnInit, Renderer2, Inject } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';

@Component({
	selector: 'app-levels',
	templateUrl: './levels.component.html',
	styleUrls: ['./levels.component.scss']
})
export class LevelsComponent implements OnInit {

	constructor(private renderer: Renderer2, public authService: AuthService, @Inject(PLATFORM_ID) private platformId: Object) { }

	ngOnInit() {


		if (isPlatformBrowser(this.platformId)) {
			this.renderer.addClass(document.body, 'modal-open');
		 }
		

	}

	ngOnDestroy() {

		if (isPlatformBrowser(this.platformId)) {
			this.renderer.removeClass(document.body, 'modal-open');
		 }
		
	}

	goBack() {
		this.authService.levelsInfo = false;
	}




}
