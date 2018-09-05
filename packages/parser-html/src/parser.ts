/**
 * @fileoverview webhint parser needed to analyze HTML files
 */

import { JSDOM } from 'jsdom';
import { JSDOMAsyncHTMLElement, JSDOMAsyncWindow } from 'hint/dist/src/lib/types/jsdom-async-html';
import { Event, ElementFound, FetchEnd, Parser, TraverseDown, TraverseUp } from 'hint/dist/src/lib/types';
import { Engine } from 'hint/dist/src/lib/engine';
import { HTMLParse } from './types';

export { HTMLParse } from './types';

export default class HTMLParser extends Parser {

    private _url = '';

    public constructor(engine: Engine) {
        super(engine, 'html');

        engine.on('fetch::end::html', this.onFetchEndHtml.bind(this));
    }

    private async onFetchEndHtml(fetchEnd: FetchEnd) {
        const resource = this._url = fetchEnd.response.url;

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

        const window = new JSDOMAsyncWindow(dom.window);
        const documentElement = dom.window.document.documentElement;

        await this.engine.emitAsync(`parse::${this.name}::end`, { html, resource, window } as HTMLParse);

        const event = { resource } as Event;

        await this.engine.emitAsync('traverse::start', event);
        await this.traverseAndNotify(documentElement);
        await this.engine.emitAsync('traverse::end', event);
    }

    /** Traverses the DOM while sending `element::typeofelement` events. */
    private async traverseAndNotify(element: HTMLElement): Promise<void> {

        await this.engine.emitAsync(`element::${element.tagName.toLowerCase()}`, {
            element: new JSDOMAsyncHTMLElement(element),
            resource: this._url
        } as ElementFound);

        const traverseEvent = {
            element: new JSDOMAsyncHTMLElement(element),
            resource: this._url
        } as TraverseDown | TraverseUp;

        await this.engine.emitAsync(`traverse::down`, traverseEvent);

        // Recursively traverse child elements.
        for (let i = 0; i < element.children.length; i++) {
            await this.traverseAndNotify(element.children[i] as HTMLElement);
        }

        await this.engine.emitAsync(`traverse::up`, traverseEvent);
    }
}
