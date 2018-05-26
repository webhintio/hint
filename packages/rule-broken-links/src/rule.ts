/**
 * @fileoverview This rule checks every link and image tag in the page and report if it is broken(400)
 */

import { Category } from 'sonarwhal/dist/src/lib/enums/category';
import { RuleContext } from 'sonarwhal/dist/src/lib/rule-context';
import {
    IRule,
    ElementFound,
    RuleMetadata
} from 'sonarwhal/dist/src/lib/types';
import { debug as d } from 'sonarwhal/dist/src/lib/utils/debug';
import { RuleScope } from 'sonarwhal/dist/src/lib/enums/rulescope';
import { Requester } from 'sonarwhal/dist/src/lib/connectors/utils/requester';
import { URL } from 'url';
const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class BrokenLinksRule implements IRule {
    public static readonly meta: RuleMetadata = {
        docs: {
            category: Category.accessibility,
            description: `Description for broken-links`
        },
        id: 'broken-links',
        schema: [],
        scope: RuleScope.any
    };

    public constructor(context: RuleContext) {
        const requester = new Requester();
        const validateElement = async (elementFound: ElementFound) => {
            const { resource } = elementFound;

            debug(`Validating rule broken-links`);

            const linkElements = await elementFound.element.ownerDocument.querySelectorAll(
                'a,img'
            );

            for (let i = 0; i < linkElements.length; i++) {

                let hrefUrl = '';
                const linkElement = linkElements[i];

                if (linkElement.nodeName === 'IMG') {
                    hrefUrl = linkElement.getAttribute('src');
                } else {
                    hrefUrl = linkElement.getAttribute('href');
                    if (hrefUrl === '/') {
                        continue;
                    }
                }

                const absoluteUrl = new URL(hrefUrl, resource).href;

                await requester.get(absoluteUrl).then(
                    async (value) => {
                        if (value.response.statusCode === 404) {
                            await context.report(
                                hrefUrl,
                                linkElement,
                                'Broken link found (404 response)'
                            );
                        }
                    },
                    async (reason) => {
                        debug(`Error accessing {$absoluteUrl}. ${JSON.stringify(reason)}`);
                        await context.report(
                            hrefUrl,
                            linkElement,
                            'Broken link found (404 response)'
                        );
                    }
                );
            }
        };

        context.on('element::body', validateElement);
    }
}
