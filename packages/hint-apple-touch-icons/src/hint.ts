/**
 * @fileoverview Check for correct usage of `apple-touch-icon`.
 */
import { imageSize as getImageData } from 'image-size';
import { ISizeCalculationResult } from 'image-size/dist/types/interface';

import { normalizeString } from '@hint/utils-string';
import { isRegularProtocol } from '@hint/utils-network';
import { debug as d } from '@hint/utils-debug';
import { HintContext, IHint, NetworkData, TraverseEnd } from 'hint';
import { HTMLDocument, HTMLElement } from '@hint/utils-dom';
import { Severity } from '@hint/utils-types';

import meta from './meta';
import { getMessage } from './i18n.import';

const debug: debug.IDebugger = d(__filename);

const recommendedSizes = [
    '120x120', /* iPhone 120px x 120px (60pt x 60pt @2x) */
    '152x152', /* iPhone 152px x 152px (76pt x 76pt @2x) */
    '167x167', /* iPhone 167px x 167px (83.5pt x 83.5pt @2x) */
    '180x180' /* iPhone 180px x 180px (60pt x 60pt @3x) */
];

type Image = {
    data: ISizeCalculationResult;
    element: HTMLElement;
};

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class AppleTouchIconsHint implements IHint {

    public static readonly meta = meta;

    public constructor(context: HintContext) {

        /*
         * This function exists because not all connector (e.g.: jsdom)
         * support matching attribute values case-insensitively.
         *
         * https://www.w3.org/TR/selectors4/#attribute-case
         */

        const getAppleTouchIcons = (elements: HTMLElement[]): HTMLElement[] => {
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

                // `normalizeString` won't return null since `relValue` isn't null.
                const relValues = normalizeString(relValue)!.split(' ');

                return relValues.includes('apple-touch-icon') || relValues.includes('apple-touch-icon-precomposed');
            });
        };

        const getImage = async (appleTouchIcon: HTMLElement, resource: string) => {
            const appleTouchIconHref = normalizeString(appleTouchIcon.getAttribute('href'));

            /*
             * Check if `href` doesn't exist, or it has the
             * value of empty string.
             */

            if (!appleTouchIconHref) {
                const message = getMessage('noEmptyHref', context.language);

                context.report(
                    resource,
                    message,
                    { element: appleTouchIcon, severity: Severity.error });

                return null;
            }

            // - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

            /*
             * The following checks don't make sense for non-HTTP(S).
             */

            if (!isRegularProtocol(resource)) {
                return null;
            }

            // - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

            /*
             * If `href` exists and is not an empty string, try
             * to figure out the full URL of the `apple-touch-icon`.
             */

            const appleTouchIconURL = appleTouchIcon.resolveUrl(appleTouchIconHref);

            // - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

            let networkData: NetworkData;

            /*
             * Try to see if the `apple-touch-icon` file actually
             * exists and is accesible.
             */

            try {
                networkData = await context.fetchContent(appleTouchIconURL);
            } catch (e) {
                debug(`Failed to fetch the ${appleTouchIconHref} file`);

                const message = getMessage('couldNotBeFetch', context.language);

                context.report(
                    resource,
                    message,
                    { element: appleTouchIcon, severity: Severity.error }
                );

                return null;
            }

            const response = networkData.response;

            if (response.statusCode !== 200) {
                const message = getMessage('couldNotBeFetchErrorStatusCode', context.language, response.statusCode.toString());

                context.report(
                    resource,
                    message,
                    { element: appleTouchIcon, severity: Severity.error }
                );

                return null;
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
                    const message = getMessage('invalidPNG', context.language);

                    context.report(
                        resource,
                        message,
                        { element: appleTouchIcon, severity: Severity.error }
                    );
                } else {
                    debug(`'getImageData' failed for '${appleTouchIconURL}'`);
                }

                return null;
            }

            return image;
        };


        const checkImage = (image: Image, someRecommended: boolean, resource: string) => {
            // Check if the image is a PNG.

            if (image.data.type !== 'png') {
                const message = getMessage('shouldBePNG', context.language);

                context.report(
                    resource,
                    message,
                    { element: image.element, severity: Severity.error }
                );
            }

            // Check the size of the image.
            const sizeString = `${image.data.width}x${image.data.height}`;

            if (!recommendedSizes.includes(sizeString)) {
                const message = getMessage('wrongResolution', context.language, recommendedSizes.toString());

                context.report(
                    resource,
                    message,
                    { element: image.element, severity: someRecommended ? Severity.warning : Severity.error }
                );
            }

            // TODO: Check if the image has some kind of transparency.
        };

        const validate = async ({ resource }: TraverseEnd) => {
            const pageDOM = context.pageDOM as HTMLDocument;
            const appleTouchIcons = getAppleTouchIcons(pageDOM.querySelectorAll('link'));

            const linksToManifest = pageDOM.querySelectorAll('link[rel="manifest"]').length > 0;

            if (appleTouchIcons.length === 0) {
                if (linksToManifest) {
                    context.report(
                        resource,
                        getMessage('noElement', context.language),
                        { severity: Severity.error });
                }

                return;
            }

            const images: Image[] = [];

            for (const appleTouchIcon of appleTouchIcons) {
                /*
                 * Check if `rel='apple-touch-icon'`.
                 * See `getAppleTouchIcons` function for more details.
                 */
                if (normalizeString(appleTouchIcon.getAttribute('rel')) !== 'apple-touch-icon') {
                    const message = getMessage('wrongRelAttribute', context.language);

                    context.report(
                        resource,
                        message,
                        { element: appleTouchIcon, severity: Severity.warning }
                    );
                }

                /*
                 * Check if the `apple-touch-icon` exists, and
                 * returns the image information.
                 */
                const image = await getImage(appleTouchIcon, resource);

                if (image) {
                    images.push({
                        data: image,
                        element: appleTouchIcon
                    });
                }
            }

            /*
             * Check if any of the images has a recommended size
             */
            const someRecommended = images.some(({data}) => {
                const sizeString = `${data.width}x${data.height}`;

                return !recommendedSizes.includes(sizeString);
            });

            for (const image of images) {
                /*
                 * Check image format and size.
                 */
                checkImage(image, someRecommended, resource);
            }

            /*
             * Check if the `apple-touch-icon` is included in the `<body>`.
             */

            const bodyAppleTouchIcons: HTMLElement[] = getAppleTouchIcons(pageDOM.querySelectorAll('body link'));

            for (const icon of bodyAppleTouchIcons) {
                const message = getMessage('elementNotInHead', context.language);

                context.report(
                    resource,
                    message,
                    { element: icon, severity: Severity.error }
                );
            }

            /*
             * Look for duplicated `apple-touch-icon`s.
             */
            const iconsHref: Set<string> = new Set();

            for (const appleTouchIcon of appleTouchIcons) {
                const href = appleTouchIcon.getAttribute('href');

                if (!href) {
                    continue;
                }

                if (iconsHref.has(href)) {
                    const message = getMessage('elementDuplicated', context.language);

                    context.report(
                        resource,
                        message,
                        { element: appleTouchIcon, severity: Severity.warning }
                    );
                }

                iconsHref.add(href);
            }
        };

        context.on('traverse::end', validate);
    }
}
