/**
 * @fileoverview Don't use P3P related headers
 */

import { Category } from 'sonarwhal/dist/src/lib/enums/category';
import { RuleContext } from 'sonarwhal/dist/src/lib/rule-context';
import { IAsyncHTMLElement, FetchEnd, Response, IRule, RuleMetadata } from 'sonarwhal/dist/src/lib/types';
import { debug as d } from 'sonarwhal/dist/src/lib/utils/debug';
import { RuleScope } from 'sonarwhal/dist/src/lib/enums/rulescope';
import { getIncludedHeaders } from 'sonarwhal/dist/src/lib/utils/rule-helpers';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class NoP3pRule implements IRule {

    public static readonly meta: RuleMetadata = {
        docs: {
            category: Category.development,
            description: `Don't use P3P related headers or meta tags`
        },
        id: 'no-p3p',
        schema: [],
        scope: RuleScope.site
    }

    public constructor(context: RuleContext) {

        const validate = async (fetchEnd: FetchEnd) => {
            const { element, resource, response }: { element: IAsyncHTMLElement, resource: string, response: Response } = fetchEnd;
            const headers: Array<string> = getIncludedHeaders(response.headers, ['p3p']);
            const numberOfHeaders: number = headers.length;

            if (numberOfHeaders > 0) {
                await context.report(resource, element, 'P3P is deprecated and should not be used');
            }
        };

        context.on('fetch::end::*', validate);
    }
}
