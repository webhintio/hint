/**
 * @fileoverview Check if a single web app manifest file is specified,
 * and if that specified file is accessible.
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import * as url from 'url';

import { IElementFoundEvent, ITraverseEndEvent, IRule, IRuleBuilder } from '../../interfaces'; // eslint-disable-line no-unused-vars
import { RuleContext } from '../../rule-context'; // eslint-disable-line no-unused-vars
import { ruleDebug } from '../../util/rule-helpers';

const debug = ruleDebug(__dirname);

// ------------------------------------------------------------------------------
// Public
// ------------------------------------------------------------------------------

const rule: IRuleBuilder = {
    create(context: RuleContext): IRule {

        let manifestIsSpecified = false;

        const manifestWasSpecified = async () => {

            // If no web app manifest file was specified when
            // the parsing of the page ended, emit an error.

            if (!manifestIsSpecified) {
                await context.report(null, null, 'Web app manifest not specified');
            }
        };

        const manifestExists = async (data: IElementFoundEvent) => {
            const { element, resource } = data;

            if (element.getAttribute('rel') === 'manifest') {

                // Check if we encounter more than one
                // <link rel="manifest"...> declaration.

                if (manifestIsSpecified) {
                    await context.report(resource, element, 'Web app manifest already specified');

                    return;
                }

                manifestIsSpecified = true;

                // Check if a web app manifest file is specified,
                // and if the specified file actually exists.
                //
                // https://w3c.github.io/manifest/#obtaining

                const manifestHref = element.getAttribute('href');
                let manifestURL = '';

                // Check if `href` doesn't exist or it has the
                // value of empty string.

                if (!manifestHref) {
                    await context.report(resource, element, `Web app manifest specified with invalid 'href'`);

                    return;
                }

                // If `href` exists and is not an empty string, try
                // to figure out the full URL of the web app manifest.

                if (url.parse(manifestHref).protocol) {
                    manifestURL = manifestHref;
                } else {
                    manifestURL = url.resolve(resource, manifestHref);
                }

                // Try to see if the web app manifest file actually
                // exists and is accesible.

                try {
                    const { response: { statusCode } } = await context.fetchContent(manifestURL);

                    // If it's not a local file (has statusCode === null),
                    // check also if the status code is `200`.

                    if (statusCode && statusCode !== 200) {
                        await context.report(resource, element, `Web app manifest file could not be fetched (status code: ${statusCode})`);
                    }

                // Check if fetching/reading the file failed.

                } catch (e) {
                    debug('Failed to fetch the web app manifest file');
                    await context.report(resource, element, `Web app manifest file request failed`);
                }

            }
        };

        return {
            'element::link': manifestExists,
            'traverse::end': manifestWasSpecified
        };
    },
    meta: {
        docs: {
            category: 'pwa',
            description: 'Provide a web app manifest file',
            recommended: true
        },
        fixable: 'code',
        schema: []
    }
};

export default rule;
