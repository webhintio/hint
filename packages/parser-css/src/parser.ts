const safe = require('postcss-safe-parser');

import * as postcss from 'postcss';

// QUESTION: any way to use import { misc, logger } from '@hint/utils' without problems with webhint?
import * as logger from '@hint/utils/dist/src/logging';
import { normalizeString } from '@hint/utils/dist/src/misc/normalize-string';
import { HTMLElement } from '@hint/utils/dist/src/dom/html';
import { ElementFound, FetchEnd, Parser } from 'hint/dist/src/lib/types';
import { StyleEvents } from './types';
import { Engine } from 'hint';

export * from './types';

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
            logger.error(`Error parsing CSS code: ${code} - ${err}`);
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
