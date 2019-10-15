const sassParser = require('postcss-sass');
const scssParser = require('postcss-scss');

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
        super(engine, 'sass');

        const emitSASS = async (code: string, parser: postcss.Parser, resource: string, element: HTMLElement | null) => {

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
                debug(`Error parsing SASS code: ${code} - ${err}`);
            }
        };

        engine.on('fetch::end::*', async (fetchEnd) => {
            const code = fetchEnd.response.body.content;
            const resource = fetchEnd.resource;

            if (fetchEnd.response.mediaType === 'text/x-sass') {
                await emitSASS(code, sassParser, resource, null);
            } else if (fetchEnd.response.mediaType === 'text/x-scss') {
                await emitSASS(code, scssParser, resource, null);
            }
        });

        engine.on('element::style', async ({ element, resource }) => {
            const lang = normalizeString(element.getAttribute('lang'));

            if (lang === 'sass') {
                await emitSASS(element.innerHTML, sassParser, resource, element);
            } else if (lang === 'scss') {
                await emitSASS(element.innerHTML, scssParser, resource, element);
            }
        });
    }
}
