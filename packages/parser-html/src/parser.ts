/**
 * @fileoverview webhint parser needed to analyze HTML files
 */

import * as cheerio from 'cheerio';
import { CheerioAsyncHTMLDocument, CheerioAsyncHTMLElement } from './cheerio-async-html';
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
        const $ = cheerio.load(html);
        const document = new CheerioAsyncHTMLDocument($);
        const documentElement = $.root()[0].children.filter((c) => {
            return c.type === 'tag';
        })[0];

        await this.engine.emitAsync(`parse::${this.name}::end`, { document, html, resource } as HTMLParse);

        const event = { resource } as Event;

        await this.engine.emitAsync('traverse::start', event);
        await this.traverseAndNotify(documentElement, document);
        await this.engine.emitAsync('traverse::end', event);
    }

    /** Traverses the DOM while sending `element::typeofelement` events. */
    private async traverseAndNotify(element: CheerioElement, root: CheerioAsyncHTMLDocument): Promise<void> {
        if (element.type !== 'tag') {
            return Promise.resolve(); // Only traverse elements.
        }

        await this.engine.emitAsync(`element::${element.tagName.toLowerCase()}`, {
            element: new CheerioAsyncHTMLElement(element, root),
            resource: this._url
        } as ElementFound);

        const traverseEvent = {
            element: new CheerioAsyncHTMLElement(element, root),
            resource: this._url
        } as TraverseDown | TraverseUp;

        await this.engine.emitAsync(`traverse::down`, traverseEvent);

        // Recursively traverse child elements.
        for (let i = 0; i < element.children.length; i++) {
            await this.traverseAndNotify(element.children[i], root);
        }

        await this.engine.emitAsync(`traverse::up`, traverseEvent);

        return Promise.resolve();
    }
}
