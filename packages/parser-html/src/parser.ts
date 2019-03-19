/**
 * @fileoverview webhint parser needed to analyze HTML files
 */

/**
 * `jsdom` always tries to load `canvas` even though it is not needed for
 * the HTML parser. If there is a mismatch between the user's node version
 * and where the HTML parser is being executed (e.g.: VS Code extension)
 * `canvas` will fail to load and crash the excution. To avoid
 * that we hijack `require`'s cache and set an empty `Module` for `canvas`
 * and `canvas-prebuilt` so `jsdom` doesn't use it and continues executing
 * normally.
 *
 */

try {
    const canvasPath = require.resolve('canvas');
    const Module = require('module');
    const fakeCanvas = new Module('', null);

    /* istanbul ignore next */
    fakeCanvas.exports = function () { };

    require.cache[canvasPath] = fakeCanvas;
} catch (e) {
    // `canvas` is not installed, nothing to do
}

import { Parser, FetchEnd } from 'hint/dist/src/lib/types';
import { Engine } from 'hint';
import createHTMLDocument from 'hint/dist/src/lib/utils/dom/create-html-document';
import { HTMLEvents } from './types';

export * from './types';

export default class HTMLParser extends Parser<HTMLEvents> {

    public constructor(engine: Engine<HTMLEvents>) {
        super(engine, 'html');

        engine.on('fetch::end::html', this.onFetchEnd.bind(this));
    }

    private async onFetchEnd(fetchEnd: FetchEnd) {
        const resource = fetchEnd.resource;

        await this.engine.emitAsync(`parse::start::html`, { resource });

        const html = fetchEnd.response.body.content;

        const document = createHTMLDocument(html);

        await this.engine.emitAsync('parse::end::html', { document, html, resource });
    }
}
