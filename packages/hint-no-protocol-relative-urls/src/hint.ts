/**
 * @fileoverview Check for protocol relative URLs.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import { debug as d } from '@hint/utils/dist/src/debug';
import { cutString } from '@hint/utils/dist/src/misc/cut-string';
import { ElementFound, IHint } from 'hint/dist/src/lib/types';
import { HintContext } from 'hint/dist/src/lib/hint-context';

import meta from './meta';
import { getMessage } from './i18n.import';

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

                const message = getMessage('noProtocolRelativeUrl', context.language, url);

                context.report(resource, message, { content: url, element });
            }
        };

        context.on('element::a', validate);
        context.on('element::link', validate);
        context.on('element::script', validate);
    }
}
