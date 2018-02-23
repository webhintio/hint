/**
 * @fileoverview Check for protocol relative URLs.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import { Category } from 'sonarwhal/dist/src/lib/enums/category';
import { debug as d } from 'sonarwhal/dist/src/lib/utils/debug';
import { IAsyncHTMLElement, IElementFound, IRule, RuleMetadata } from 'sonarwhal/dist/src/lib/types';
import { cutString } from 'sonarwhal/dist/src/lib/utils/misc';
import { RuleContext } from 'sonarwhal/dist/src/lib/rule-context';
import { RuleScope } from 'sonarwhal/dist/src/lib/enums/rulescope';

const debug = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class NoProtocolRelativeUrlsRule implements IRule {
    private _id: string;

    public get id() {
        return this._id;
    }

    public static readonly meta: RuleMetadata = {
        docs: {
            category: Category.security,
            description: 'Disallow protocol relative URLs'
        },
        schema: [],
        scope: RuleScope.any
    }

    public constructor(id: string, context: RuleContext) {

        this._id = id;

        const validate = async (data: IElementFound) => {
            const { element, resource }: { element: IAsyncHTMLElement, resource: string } = data;
            const html: string = await element.outerHTML();

            debug(`Analyzing link\n${cutString(html, 50)}`);

            /*
             * We need to use getAttribute to get the exact value.
             * If we access the src or href properties directly the
             * browser already adds http(s):// so we cannot verify.
             */

            const url: string = (element.getAttribute('src') || element.getAttribute('href') || '').trim();

            if (url.startsWith('//')) {
                debug('Protocol relative URL found');

                await context.report(resource, element, `Protocol relative URL found: ${url}`, url);
            }
        };

        context.on(this.id, 'element::a', validate);
        context.on(this.id, 'element::link', validate);
        context.on(this.id, 'element::script', validate);
    }
}
