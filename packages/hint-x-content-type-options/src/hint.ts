/**
 * @fileoverview Check if responses are served with the
 * `X-Content-Type-Options` HTTP response header.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import { debug as d } from '@hint/utils-debug';
import { normalizeString } from '@hint/utils-string';
import { isDataURI } from '@hint/utils-network';
import { FetchEnd, IHint } from 'hint/dist/src/lib/types';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { Severity } from '@hint/utils-types';
import meta from './meta';
import { getMessage } from './i18n.import';

const debug = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class XContentTypeOptionsHint implements IHint {

    public static readonly meta = meta;
    public constructor(context: HintContext) {
        const validate = ({ element, resource, response }: FetchEnd) => {
            // This check does not make sense for data URI.

            if (isDataURI(resource)) {
                debug(`Check does not apply for data URI: ${resource}`);

                return;
            }

            const headerValue: string | null = normalizeString(response.headers && response.headers['x-content-type-options']);

            if (headerValue === null) {
                context.report(
                    resource,
                    getMessage('shouldInclude', context.language),
                    {
                        element,
                        severity: Severity.error
                    });

                return;
            }

            if (headerValue !== 'nosniff') {
                context.report(
                    resource,
                    getMessage('nosniff', context.language),
                    {
                        codeLanguage: 'http',
                        codeSnippet: `X-Content-Type-Options: ${headerValue}`,
                        element,
                        severity: Severity.error
                    });

                return;
            }

            return;
        };

        context.on('fetch::end::*', validate);
    }
}
