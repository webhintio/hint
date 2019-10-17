/**
 * @fileoverview webhint parser needed to analyze HTML files
 */

import { createHTMLDocument } from '@hint/utils/dist/src/dom/create-html-document';
import { Parser, FetchEnd } from 'hint/dist/src/lib/types';
import { Engine } from 'hint/dist/src/lib/engine';
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

        const document = createHTMLDocument(html, fetchEnd.resource);

        await this.engine.emitAsync('parse::end::html', { document, html, resource });
    }
}
