/**
 * @fileoverview Check for protocol relative URLs.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import { debug as d } from 'hint/dist/src/lib/utils/debug';
import { ElementFound, IHint } from 'hint/dist/src/lib/types';
import cutString from 'hint/dist/src/lib/utils/misc/cut-string';
import { HintContext } from 'hint/dist/src/lib/hint-context';

import meta from './meta';

const debug = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class NoProtocolRelativeUrlsHint implements IHint {

    public static readonly meta = meta;

    public constructor(context: HintContext) {

        const validate = ({ element, resource }: ElementFound) => {
            if (debug.enabled) {
                const html = element.outerHTML;

                debug(`Analyzing link\n${cutString(html, 50)}`);
            }

            /*
             * We need to use getAttribute to get the exact value.
             * If we access the src or href properties directly the
             * browser already adds http(s):// so we cannot verify.
             */

            const url: string = (element.getAttribute('src') || element.getAttribute('href') || '').trim();

            if (url.startsWith('//')) {
                debug('Protocol relative URL found');

                const message = `'${url}' should not be specified as a protocol-relative URL.`;

                context.report(resource, message, { content: url, element });
            }
        };

        context.on('element::a', validate);
        context.on('element::link', validate);
        context.on('element::script', validate);
    }
}
