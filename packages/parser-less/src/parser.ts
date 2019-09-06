const parser = require('postcss-less');

import * as postcss from 'postcss';

import { debug as d } from '@hint/utils/dist/src/debug';
import { normalizeString } from '@hint/utils/dist/src/misc/normalize-string';
import { HTMLElement } from '@hint/utils/dist/src/dom/html';
import { Parser } from 'hint/dist/src/lib/types';
import { StyleEvents } from '@hint/parser-css';
import { Engine } from 'hint';

const debug = d(__filename);

export default class CSSParser extends Parser<StyleEvents> {
    public constructor(engine: Engine<StyleEvents>) {
        super(engine, 'less');

        const emitLESS = async (code: string, resource: string, element: HTMLElement | null) => {

            try {
                await this.engine.emitAsync(`parse::start::css`, { resource });

                const result = await postcss().process(code, { from: resource, parser });
                const ast = result.root!; // always defined even for '' (typings error?)

                await this.engine.emitAsync(`parse::end::css`, {
                    ast,
                    code,
                    element,
                    resource
                });

            } catch (err) /* istanbul ignore next */ {
                debug(`Error parsing LESS code: ${code} - ${err}`);
            }
        };

        engine.on('fetch::end::*', async (fetchEnd) => {
            const code = fetchEnd.response.body.content;
            const mediaType = fetchEnd.response.mediaType;
            const resource = fetchEnd.resource;

            if (mediaType === 'text/less' || mediaType === 'text/x-less') {
                await emitLESS(code, resource, null);
            }
        });

        engine.on('element::style', async ({ element, resource }) => {
            const type = normalizeString(element.getAttribute('type'));

            if (type === 'text/less' || type === 'text/x-less') {
                await emitLESS(element.innerHTML, resource, element);
            }
        });
    }
}
