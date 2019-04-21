/**
 * @fileoverview Checks usage of Web App Manifest icons
 */
import { URL } from 'url';
import * as getImageData from 'image-size';
import { HintContext } from 'hint/dist/src/lib/hint-context';
// The list of types depends on the events you want to capture.
import { IHint, NetworkData } from 'hint/dist/src/lib/types';
import {
    ManifestEvents,
    ManifestParsed,
    ManifestImageResource
} from '@hint/parser-manifest';
import { debug as d } from '@hint/utils';

import meta from './meta';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class ManifestIconHint implements IHint {
    public static readonly meta = meta;
    public constructor(context: HintContext<ManifestEvents>) {
        /**
         * Try to see if the `icon` file actually
         * exists and is accessible.
         */
        const iconExists = async (IconPath: string) => {
            let networkData: NetworkData;

            try {
                networkData = await context.fetchContent(IconPath);
            } catch (e) {
                debug(`Failed to fetch the ${IconPath} file`);
                const message = `'${IconPath}' could not be fetched (request failed).`;

                context.report(IconPath, message);

                return;
            }
            const response = networkData.response;

            if (response.statusCode !== 200) {
                const message = `'${IconPath}' could not be fetched (status code: ${
                    response.statusCode
                }).`;

                context.report(IconPath, message);

                return;
            }

            let image;

            try {
                image = getImageData(response.body.rawContent);
            } catch (e) {
                if (e instanceof TypeError) {
                    const message = `'${IconPath}' should be a valid PNG image.`;

                    context.report(IconPath, message);
                } else {
                    debug(`'getImageData' failed for '${IconPath}'`);
                }

                return;
            }

            // Check if the image is a PNG.
            if (image.type !== 'png') {
                const message = `'${IconPath}' should be a PNG image but found be a
                                    ${image.type} image`;

                context.report(IconPath, message);
            }

            // Check if the image is 180x180px.
            /*
             * if (image.width !== 180 || image.height !== 180) {
             *     const message = `'${IconPath}' should be 180x180px.`;
             */

            /*
             *     context.report(IconPath, message);
             * }
             */
        };

        /**
         *
         * @param icons array of the icons properties
         * @param hostnameWithProtocol
         */
        const validIconsURLs = (
            icons: ManifestImageResource[],
            hostnameWithProtocol: string
        ) => {
            icons.forEach(async (iconProps: { src: string }) => {
                await iconExists(`${hostnameWithProtocol}/${iconProps.src}`);
            });

            return;
        };

        const validate = (parseEnd: ManifestParsed) => {
            const {
                parsedContent: { icons },
                resource
            } = parseEnd;
            const resourceURL = new URL(resource);
            const hostnameWithProtocol = `${resourceURL.protocol}//${
                resourceURL.host
            }`;

            debug(`Validating hint manifest-icon`);
            /**
             * console.log(`\n--------
             * ${JSON.stringify(hostnameWithProtocol, null, '\t')}
             *--------`);
             */

            if (icons !== undefined) {
                validIconsURLs(icons, hostnameWithProtocol);
            }

            /*
             * This is where all the magic happens. Any errors found should be
             * reported using the `context` object. E.g.:
             * context.report(resource, 'Add error message here.');
             *
             * More information on how to develop a hint is available in:
             * https://webhint.io/docs/contributor-guide/hints/
             */

            if (Math.ceil(Math.random()) === 0) {
                context.report(
                    JSON.stringify('asd'),
                    'Add error message here.'
                );
            }
        };

        context.on('parse::end::manifest', validate);
    }
}
