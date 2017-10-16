/**
 * @fileoverview Check for correct usage of `apple-touch-icon`.
 */

import * as url from 'url';

import * as getImageData from 'image-size';

import { Category } from '../../enums/category';
import { debug as d } from '../../utils/debug';
import { isHTMLDocument, isRegularProtocol, normalizeString } from '../../utils/misc';
import { IAsyncHTMLDocument, IAsyncHTMLElement, ITraverseEnd, INetworkData } from '../../types';
import { IRule, IRuleBuilder } from '../../types';
import { RuleContext } from '../../rule-context';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

const rule: IRuleBuilder = {
    create(context: RuleContext): IRule {

        /*
         * This function exists because not all connector (e.g.: jsdom)
         * support matching attribute values case-insensitively.
         *
         * https://www.w3.org/TR/selectors4/#attribute-case
         */

        const getAppleTouchIcons = (elements: Array<IAsyncHTMLElement>): Array<IAsyncHTMLElement> => {
            return elements.filter((element) => {

                /*
                 * `apple-touch-icon`s can be defined either by using:
                 *
                 *      <link rel="apple-touch-icon" href="...">
                 *
                 *  or
                 *
                 *      <link rel="apple-touch-icon-precomposed" href="...">
                 *
                 *  or, since the `rel` attribute accepts a space
                 *  separated list of values in HTML, theoretically:
                 *
                 *      <link rel="apple-touch-icon-precomposed apple-touch-icon" href="...">
                 *
                 *  but that doesn't work in practice.
                 */

                const relValue = element.getAttribute('rel');

                if (relValue === null) {
                    return false;
                }

                const relValues = normalizeString(element.getAttribute('rel')).split(' ');

                return relValues.includes('apple-touch-icon') || relValues.includes('apple-touch-icon-precomposed');
            });
        };

        const checkImage = async (appleTouchIcon: IAsyncHTMLElement, resource: string) => {
            const appleTouchIconHref = normalizeString(appleTouchIcon.getAttribute('href'));

            /*
             * Check if `href` doesn't exist, or it has the
             * value of empty string.
             */

            if (!appleTouchIconHref) {
                await context.report(resource, appleTouchIcon, `'apple-touch-icon' should have non-empty 'href' attribute`);

                return;
            }

            /*
             * - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
             * The following checks don't make sense for non-HTTP(S).
             */

            if (!isRegularProtocol(resource)) {
                return;
            }

            // - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

            let appleTouchIconURL = '';

            /*
             * If `href` exists and is not an empty string, try
             * to figure out the full URL of the `apple-touch-icon`.
             */

            if (url.parse(appleTouchIconHref).protocol) {
                appleTouchIconURL = appleTouchIconHref;
            } else {
                appleTouchIconURL = url.resolve(resource, appleTouchIconHref);
            }

            // - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

            let networkData: INetworkData;

            /*
             * Try to see if the `apple-touch-icon` file actually
             * exists and is accesible.
             */

            try {
                networkData = await context.fetchContent(appleTouchIconURL);
            } catch (e) {
                debug(`Failed to fetch the ${appleTouchIconHref} file`);
                await context.report(resource, appleTouchIcon, `'${appleTouchIconHref}' file request failed`);

                return;
            }

            const response = networkData.response;

            if (response.statusCode !== 200) {
                await context.report(resource, appleTouchIcon, `'${appleTouchIconHref}' could not be fetched (status code: ${response.statusCode})`);

                return;
            }

            // - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

            let image;

            /*
             * Notes:
             *
             *  * Async version of `image-size` doesn't work if the
             *    input is a Buffer.
             *
             *    https://github.com/image-size/image-size/tree/4c527ba608d742fbb29f6d9b3c77b831b069cbb2#asynchronous
             *
             * * `image-size` will throw a `TypeError` error if it does
             *    not understand the file type or the image is invalid
             *    or corrupted.
             */

            try {
                image = getImageData(response.body.rawContent);
            } catch (e) {
                if (e instanceof TypeError) {
                    await context.report(resource, appleTouchIcon, `'${appleTouchIconHref}' is not a valid PNG`);
                } else {
                    debug(`'getImageData' failed for '${appleTouchIconURL}'`);
                }

                return;
            }

            // Check if the image is a PNG.

            if (image.type !== 'png') {
                await context.report(resource, appleTouchIcon, `'${appleTouchIconHref}' is not a PNG`);
            }

            // Check if the image is 180x180px.

            if (image.width !== 180 || image.height !== 180) {
                await context.report(resource, appleTouchIcon, `'${appleTouchIconHref}' is not 180x180px`);
            }

            // TODO: Check if the image has some kind of transparency.
        };

        const chooseBestIcon = (icons: Array<IAsyncHTMLElement>): IAsyncHTMLElement => {

            /*
             * Site will usually have something such as:
             *
             * <link rel="apple-touch-icon" sizes="60x60" href="/apple-touch-icon-60x60.png">
             * <link rel="apple-touch-icon" sizes="72x72" href="/apple-touch-icon-72x72.png">
             * <link rel="apple-touch-icon" sizes="76x76" href="/apple-touch-icon-76x76.png">
             * <link rel="apple-touch-icon" sizes="114x114" href="/apple-touch-icon-114x114.png">
             * <link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120x120.png">
             * <link rel="apple-touch-icon" sizes="144x144" href="/apple-touch-icon-144x144.png">
             * <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png">
             * <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180x180.png">
             * <link rel="apple-touch-icon" href="/apple-touch-icon-57x57.png">
             *
             * so what this function will try to do is select the
             * icon that will most likely generate the fewest errors.
             */

            let bestIcon;

            for (const icon of icons) {
                const sizes = normalizeString(icon.getAttribute('sizes'));

                if (sizes === '180x180') {
                    return icon;
                } else if (!sizes) {
                    bestIcon = icon;
                }
            }

            return bestIcon || icons[0];
        };


        const validate = async (event: ITraverseEnd) => {
            const { resource }: { resource: string } = event;

            // The following checks don't make sense for non-HTML documents.

            if (!isHTMLDocument(resource, context.pageHeaders)) {
                return;
            }

            // - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

            const pageDOM: IAsyncHTMLDocument = context.pageDOM as IAsyncHTMLDocument;
            const appleTouchIcons: Array<IAsyncHTMLElement> = getAppleTouchIcons(await pageDOM.querySelectorAll('link'));

            if (appleTouchIcons.length === 0) {
                await context.report(resource, null, `No 'apple-touch-icon' was specified`);

                return;
            }

            /*
             * - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
             * Choose the icon that will most likely
             * pass most of the following tests.
             */

            const appleTouchIcon: IAsyncHTMLElement = chooseBestIcon(appleTouchIcons);

            /*
             * - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
             * Check if `rel='apple-touch-icon'`.
             * See `getAppleTouchIcons` function for more details.
             */

            if (normalizeString(appleTouchIcon.getAttribute('rel')) !== 'apple-touch-icon') {
                await context.report(resource, appleTouchIcon, `'rel' attribute value should be 'apple-touch-icon'`);
            }

            /*
             * - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
             * Since we are recommending just one icon, the `sizes`
             * attribute is not needed. Also, pre-4.2 versions of iOS
             * ignore the `sizes` attribute.
             *
             * https://mathiasbynens.be/notes/touch-icons
             * https://html.spec.whatwg.org/multipage/semantics.html#attr-link-sizes
             */

            if (appleTouchIcon.getAttribute('sizes')) {
                await context.report(resource, appleTouchIcon, `'sizes' attribute is not needed`);
            }

            /*
             * - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
             * Check if the `apple-touch-icon` exists, is the right
             * image format, the right size, etc.
             */

            await checkImage(appleTouchIcon, resource);

            /*
             * - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
             * Check if the `apple-touch-icon` is included in the `<body>`.
             */

            const bodyAppleTouchIcons: Array<IAsyncHTMLElement> = getAppleTouchIcons(await pageDOM.querySelectorAll('body link'));

            for (const icon of bodyAppleTouchIcons) {
                if (icon.isSame(appleTouchIcon)) {
                    await context.report(resource, appleTouchIcon, `'apple-touch-icon' should be specified in the '<head>'`);
                }
            }

            /*
             * - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
             * All other `apple-touch-icon`s should not be included.
             */

            for (const icon of appleTouchIcons) {
                if (!icon.isSame(appleTouchIcon)) {
                    await context.report(resource, icon, `A 'apple-touch-icon' was already specified`);
                }
            }
        };

        return { 'traverse::end': validate };
    },

    meta: {
        docs: {
            category: Category.pwa,
            description: `Require an 'apple-touch-icon'`
        },
        recommended: true,
        schema: [],
        worksWithLocalFiles: true
    }
};

module.exports = rule;
