/**
 * @fileoverview Check if the content of the web app manifest file is valid.
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import { debug as d } from '../../utils/debug';
import { IManifestFetchEnd, IResponse, IRule, IRuleBuilder } from '../../types'; // eslint-disable-line no-unused-vars
import { RuleContext } from '../../rule-context'; // eslint-disable-line no-unused-vars

const debug = d(__filename);

// ------------------------------------------------------------------------------
// Public
// ------------------------------------------------------------------------------

const rule: IRuleBuilder = {
    create(context: RuleContext): IRule {

        const manifestIsValid = async (data: IManifestFetchEnd) => {
            const { resource, response: { body: { content }, statusCode } }: { resource: string, response: IResponse } = data;

            if (statusCode !== 200) {
                return;
            }

            // null, empty string, etc. are not valid manifests
            if (!content) {
                await context.report(resource, null, `Web app manifest file is not a text file`);
                debug('Web app manifest file is not a text file');

                return;
            }

            try {
                // TODO: Add more complex web app manifest file validation.
                JSON.parse(content);
            } catch (e) {
                debug('Failed to parse the web app manifest file');
                await context.report(resource, null, `Web app manifest file doesn't contain valid JSON`);
            }
        };

        return { 'manifestfetch::end': manifestIsValid };
    },
    meta: {
        docs: {
            category: 'pwa',
            description: 'Require valid web app manifest'
        },
        fixable: 'code',
        recommended: true,
        schema: [],
        worksWithLocalFiles: true
    }
};

export default rule;
