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

import { JSDOM } from 'jsdom';
import { JSDOMAsyncHTMLElement, JSDOMAsyncWindow } from 'hint/dist/src/lib/types/jsdom-async-html';
import { Event, FetchEnd, Parser, TraverseDown, TraverseUp } from 'hint/dist/src/lib/types';
import { Engine } from 'hint';
import { HTMLEvents } from './types';

export * from './types';

export default class HTMLParser extends Parser<HTMLEvents> {

    private _url = '';

    public constructor(engine: Engine<HTMLEvents>) {
        super(engine, 'html');

        engine.on('fetch::end::html', this.onFetchEndHtml.bind(this));
    }

    private async onFetchEndHtml(fetchEnd: FetchEnd) {
        const resource = this._url = fetchEnd.response.url;

        await this.engine.emitAsync(`parse::start::html`, { resource });

        const html = fetchEnd.response.body.content;

        const dom = new JSDOM(html, {

            /** Needed to provide line/column positions for elements. */
            includeNodeLocations: true,

            /**
             * Needed to let hints run script against the DOM.
             * However the page itself is kept static because `connector-local`
             * validates files individually without loading resources.
             */
            runScripts: 'outside-only'

        });

        const window = new JSDOMAsyncWindow(dom.window, dom);
        const documentElement = dom.window.document.documentElement;

        await this.engine.emitAsync(`parse::end::html`, { html, resource, window });

        const event = { resource } as Event;

        /* istanbul ignore if */
        if (!documentElement) {
            return;
        }

        await this.engine.emitAsync('traverse::start', event);
        await this.traverseAndNotify(documentElement, dom);
        await this.engine.emitAsync('traverse::end', event);
    }

    /** Traverses the DOM while sending `element::typeofelement` events. */
    private async traverseAndNotify(element: HTMLElement, dom: JSDOM): Promise<void> {

        await this.engine.emitAsync(`element::${element.tagName.toLowerCase()}` as 'element::*', {
            element: new JSDOMAsyncHTMLElement(element, dom),
            resource: this._url
        });

        const traverseEvent = {
            element: new JSDOMAsyncHTMLElement(element, dom),
            resource: this._url
        } as TraverseDown | TraverseUp;

        await this.engine.emitAsync(`traverse::down`, traverseEvent);

        // Recursively traverse child elements.
        for (let i = 0; i < element.children.length; i++) {
            await this.traverseAndNotify(element.children[i] as HTMLElement, dom);
        }

        await this.engine.emitAsync(`traverse::up`, traverseEvent);
    }
}
