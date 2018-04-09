/**
 * @fileoverview Warns against having the BOM character at the beginning of a text file
 */
import { Category } from 'sonarwhal/dist/src/lib/enums/category';
import { RuleScope } from 'sonarwhal/dist/src/lib/enums/rulescope';
import { RuleContext } from 'sonarwhal/dist/src/lib/rule-context';
import { FetchEnd, IRule, NetworkData, RuleMetadata } from 'sonarwhal/dist/src/lib/types';
import { asyncTry } from 'sonarwhal/dist/src/lib/utils/async-wrapper';
import { isTextMediaType } from 'sonarwhal/dist/src/lib/utils/content-type';
import { debug as d } from 'sonarwhal/dist/src/lib/utils/debug';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class implements IRule {

    public static readonly meta: RuleMetadata = {
        docs: {
            category: Category.interoperability,
            description: `Warns against using the BOM (byte-order marker) character at the beginning of a text based file`
        },
        id: 'no-bom',
        schema: [],
        scope: RuleScope.any
    }

    public constructor(context: RuleContext) {

        const validateFetchEnd = async (fetchEnd: FetchEnd) => {
            debug(`Validating rule no-bom`);

            if (!isTextMediaType(fetchEnd.response.mediaType)) {
                return;
            }

            /*
             * Chrome strips the BOM so we need to request the asset again using `fetchContent`
             * that will use the `request` module
             */
            const { resource, element } = fetchEnd;
            const safeFetch = asyncTry<NetworkData>(context.fetchContent.bind(context));
            const request = await safeFetch(resource);

            if (!request) {
                await context.report(resource, element, 'Error fetching the content');

                debug(`Error requesting the resource: ${resource}`);

                return;
            }

            const content = request.response.body.rawContent;

            if (content[0] === 0xEF && content[1] === 0xBB && content[2] === 0xBF) {
                await context.report(resource, element, `Text based resources shouldn't start with the BOM character to force UTF-8 encoding`);
            }

        };

        context.on('fetch::end::*', validateFetchEnd);
    }
}
