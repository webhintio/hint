/**
 * @fileoverview Check for protocol relative URLs.
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import { loggerInitiator } from '../../utils/logging';
import { IAsyncHTMLElement, IElementFound, IRule, IRuleBuilder } from '../../types'; // eslint-disable-line no-unused-vars
import { normalizeString } from '../../utils/misc';
import { RuleContext } from '../../rule-context'; // eslint-disable-line no-unused-vars

const logger = loggerInitiator(__filename);

// ------------------------------------------------------------------------------
// Public
// ------------------------------------------------------------------------------

const rule: IRuleBuilder = {
    create(context: RuleContext): IRule {

        const validate = async (data: IElementFound) => {
            const { element, resource }: { element: IAsyncHTMLElement, resource: string } = data;
            const html: string = await element.outerHTML();

            logger.debug(`Analyzing link\n${html}`);

            // We need to use getAttribute to get the exact value.
            // If we access the src or href properties directly the
            // browser already adds http(s):// so we cannot verify.

            const url: string = normalizeString(
                element.getAttribute('src') ||
                element.getAttribute('href')
            );

            if (url && (url.indexOf('//') === 0)) {
                logger.debug('Protocol relative URL found');

                await context.report(resource, element, `Protocol relative URL found: ${url}`, url);
            }
        };

        return {
            'element::a': validate,
            'element::link': validate,
            'element::script': validate
        };

    },
    meta: {
        docs: {
            category: 'security',
            description: 'Disallow protocol relative URLs'
        },
        fixable: 'code',
        recommended: true,
        schema: [],
        worksWithLocalFiles: true
    }
};

export default rule;
