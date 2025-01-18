import 'zone.js/dist/zone-node';
import { ngExpressEngine } from '@nguniversal/express-engine';
import { join } from 'path';
import { AppServerModule } from './src/main.server';
import { APP_BASE_HREF } from '@angular/common';
import { existsSync } from 'fs';
import  * as express from 'express';

const domino = require('domino');
const fs = require('fs');
const path = require('path');
const template = fs.readFileSync(path.join('.', 'dist/dtg-web/browser', 'index.html')).toString();
const win = domino.createWindow(template);
const Element = domino.impl.Element; // etc
global['window'] = win;
global['document'] = win.document;
global['Element'] = Element;



// The Express app is exported so that it can be used by serverless Functions.
export function run() {

	const app = express();
	const http = require('http').createServer(app);
	const distFolder = join(process.cwd(), 'dist/dtg-web/browser');
	const indexHtml = existsSync(join(distFolder, 'index.original.html')) ? 'index.original.html' : 'index';

	// Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
	app.engine('html', ngExpressEngine({
		bootstrap: AppServerModule,
	}));

	app.set('view engine', 'html');
	app.set('views', distFolder);

	// Serve static files from /browser
	app.get('*.*', express.static(distFolder, {
		maxAge: '1y'
	}));

	// All regular routes use the Universal engine
	app.get('*', (req, res) => {
		res.render(indexHtml, { req, providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }] });
	});

	const port = process.env.PORT || 3000;
	http.listen(port, () => {
		console.log(`Node Express server listening on http://localhost:${port}`);
	});

}


// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = mainModule && mainModule.filename || '';
if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
	run();
}

export * from './src/main.server';
