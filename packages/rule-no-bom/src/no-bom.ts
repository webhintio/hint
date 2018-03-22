/**
 * @fileoverview Warns against having the BOM character at the beginning of a text file
 */

import { Category } from 'sonarwhal/dist/src/lib/enums/category';
import { RuleContext } from 'sonarwhal/dist/src/lib/rule-context';
import { IRule, FetchEnd, RuleMetadata } from 'sonarwhal/dist/src/lib/types';
import { debug as d } from 'sonarwhal/dist/src/lib/utils/debug';
import { isTextMediaType } from 'sonarwhal/dist/src/lib/utils/content-type';
import { RuleScope } from 'sonarwhal/dist/src/lib/enums/rulescope';

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
            const request = await context.fetchContent(resource);
            const content = request.response.body.rawContent;

            if (content[0] === 0xEF && content[1] === 0xBB && content[2] === 0xBF) {
                await context.report(resource, element, `Text based files shouldn't start with the BOM character to force UTF-8 encoding`);
            }

        };

        context.on('fetch::end::*', validateFetchEnd);
    }
}
