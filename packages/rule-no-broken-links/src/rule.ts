/**
 * @fileoverview This rule checks every link and image tag in the page and report if it is broken
 * Checks for 404, 410 and 500 status
 */

import { Category } from 'sonarwhal/dist/src/lib/enums/category';
import { RuleContext } from 'sonarwhal/dist/src/lib/rule-context';
import {
    IRule,
    ElementFound,
    RuleMetadata,
    IAsyncHTMLElement
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

export default class NoBrokenLinksRule implements IRule {
    public static readonly meta: RuleMetadata = {
        docs: {
            category: Category.accessibility,
            description: `Rule to flag broken links in the page`
        },
        id: 'no-broken-links',
        schema: [],
        scope: RuleScope.site
    };

    public constructor(context: RuleContext) {
        const requester = new Requester();
        const brokenStatusCodes = [404, 410, 500, 503];


        // This method checks whether a url is broken and report if it is
        const reportBrokenLink = async (hrefUrl: string, resource: any, linkElement: IAsyncHTMLElement) => {
            const absoluteUrl = new URL(hrefUrl, resource).href;

            await requester.get(absoluteUrl).then(
                async (value) => {
                    const statusIndex = brokenStatusCodes.indexOf(value.response.statusCode);

                    if (statusIndex>-1) {
                        await context.report(
                            absoluteUrl,
                            linkElement,
                            `Broken link found (${brokenStatusCodes[statusIndex]} response)`
                        );
                    }
                },
                async (reason) => {
                    debug(`Error accessing {$absoluteUrl}. ${JSON.stringify(reason)}`);
                    await context.report(
                        absoluteUrl,
                        linkElement,
                        'Broken link found (404 response)'
                    );
                }
            );
        };

        const checkImageElement = async(linkElement: IAsyncHTMLElement, resource: any) => {

            const imageSrc = linkElement.getAttribute('src');

            await reportBrokenLink(imageSrc, resource, linkElement);

            // Check for srcset attribute value if that exist
            const srcSet = linkElement.getAttribute('srcset');

            if (srcSet!==null) {
                const sources = srcSet.split(',').filter((x) => {
                    return x!=='';
                });

                for (const source of sources) {
                    const url = source.split(' ').filter((x) => {
                        return x!=='';
                    })[0];

                    await reportBrokenLink(url, resource, linkElement);
                }
            }
        };

        const checkAnchorTag = async(linkElement: IAsyncHTMLElement, resource: any) => {

            const hrefUrl = linkElement.getAttribute('href');

            if (hrefUrl !== '/') {
                await reportBrokenLink(hrefUrl, resource, linkElement);
            }
        };


        const validateElement = async (elementFound: ElementFound) => {
            const { resource } = elementFound;

            debug(`Validating rule no-broken-links`);

            const linkElements = await elementFound.element.ownerDocument.querySelectorAll(
                'a,img'
            );

            for (let i = 0; i < linkElements.length; i++) {
                const linkElement = linkElements[i];

                if (linkElement.nodeName === 'IMG') {
                    await checkImageElement(linkElement, resource);
                } else {
                    await checkAnchorTag(linkElement, resource);
                }
            }
        };


        context.on('element::body', validateElement);
    }
}
