/**
 * @fileoverview Check for protocol relative URLs.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import { debug as d } from '@hint/utils-debug';
import { cutString } from '@hint/utils-string';
import { ElementFound, IHint } from 'hint/dist/src/lib/types';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { Severity } from '@hint/utils-types';
import { isHTTPS } from '@hint/utils-network';

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
            const rel = element.getAttribute('rel') || '';

            if (url.startsWith('//') && rel !== 'dns-prefetch') {
                debug('Protocol relative URL found');

                const message = getMessage('noProtocolRelativeUrl', context.language);

                const severity = isHTTPS(resource) ?
                    Severity.hint :
                    Severity.warning;

                context.report(
                    resource,
                    message,
                    {
                        content: url,
                        element,
                        severity
                    });
            }
        };

        context.on('element::a', validate);
        context.on('element::link', validate);
        context.on('element::script', validate);
    }
}
