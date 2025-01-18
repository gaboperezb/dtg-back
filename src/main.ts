import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import 'froala-editor/js/plugins/fullscreen.min.js';
import 'froala-editor/js/plugins/code_view.min.js';
import "froala-editor/js/plugins/align.min.js"
import "froala-editor/js/plugins/char_counter.min.js"
import "froala-editor/js/plugins/draggable.min.js"
import "froala-editor/js/third_party/embedly.min.js"
import "froala-editor/js/plugins/emoticons.min.js"
import "froala-editor/js/plugins/file.min.js"
import "src/assets/js/image.min.js" //aqui es el error
import "froala-editor/js/plugins/video.min.js"
import "froala-editor/js/plugins/font_size.min.js"
import "froala-editor/js/plugins/fullscreen.min.js"
import "froala-editor/js/plugins/help.min.js"
import "froala-editor/js/plugins/table.min.js"
import "froala-editor/js/plugins/image_manager.min.js"
import "froala-editor/js/plugins/line_breaker.min.js"
import "froala-editor/js/plugins/link.min.js"
import "froala-editor/js/plugins/lists.min.js"
import "froala-editor/js/plugins/help.min.js"
import "froala-editor/js/plugins/paragraph_format.min.js"
import "froala-editor/js/plugins/paragraph_style.min.js"
import "froala-editor/js/plugins/quote.min.js"
import "froala-editor/js/third_party/spell_checker.min.js"
import "froala-editor/js/plugins/url.min.js"
import "froala-editor/js/plugins/help.min.js"
import "froala-editor/js/plugins/paragraph_style.min.js"
import "froala-editor/js/plugins/word_paste.min.js"

if (environment.production) {
  enableProdMode();
}
document.addEventListener('DOMContentLoaded', () => {
 platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
});
