const safe = require('postcss-safe-parser');
const postcss = require('postcss');

import { debug as d } from '@hint/utils-debug';
import { normalizeString } from '@hint/utils-string';
import { HTMLElement } from '@hint/utils-dom';
import { ElementFound, FetchEnd, Parser } from 'hint/dist/src/lib/types';
import { StyleEvents } from './types';
import { Engine } from 'hint';

export * from './types';

const debug = d(__filename);

export default class CSSParser extends Parser<StyleEvents> {
    public constructor(engine: Engine<StyleEvents>) {
        super(engine, 'css');

        engine.on('fetch::end::css', this.parseCSS.bind(this));
        engine.on('element::style', this.parseStyleTag.bind(this));
    }

    private async emitCSS(code: string, resource: string, element: HTMLElement | null) {

        try {
            await this.engine.emitAsync(`parse::start::css`, { resource });

            const result = await postcss().process(code, { from: resource, parser: safe });
            const ast = result.root!; // always defined even for '' (typings error?)

            await this.engine.emitAsync(`parse::end::css`, {
                ast,
                code,
                element,
                resource
            });

        } catch (err) /* istanbul ignore next */ {
            const errorContext =
            `{ parser: parser-css, code_length:${code ? code.length : 0},element:${element}, resource: ${resource} }`;

            debug(`Error parsing CSS with context: ${errorContext}`);
        }
    }

    private async parseCSS(fetchEnd: FetchEnd) {
        const code = fetchEnd.response.body.content;
        const resource = fetchEnd.resource;

        await this.emitCSS(code, resource, null);
    }

    private isCSSType(element: HTMLElement) {
        const type = normalizeString(element.getAttribute('type'));

        /*
         * From: https://html.spec.whatwg.org/multipage/semantics.html#update-a-style-block
         *
         * If element's type attribute is present and its value is neither
         * the empty string nor an ASCII case-insensitive match for
         * "text/css", then return.
         */
        return !type || type === 'text/css';
    }

    private async parseStyleTag({ element, resource }: ElementFound) {

        if (!this.isCSSType(element)) {
            // Ignore if it is not CSS.
            return;
        }

        await this.emitCSS(element.innerHTML, resource, element);
    }
}
