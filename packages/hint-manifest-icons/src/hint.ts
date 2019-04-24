/**
 * @fileoverview Checks usage of Web App Manifest icons
 */
import { URL } from 'url';
import * as getImageData from 'image-size';
import imageType, { ImageTypeResult } from 'image-type';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint, NetworkData } from 'hint/dist/src/lib/types';
import { ManifestEvents, ManifestParsed, ManifestImageResource } from '@hint/parser-manifest';
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
        const getIconFullPath = (iconSrc: string, hostnameWithProtocol: string) => {
            return `${hostnameWithProtocol}/${iconSrc}`;
        };

        /**
         * Try to see if the `icon` file actually
         * exists and is accessible.
         */
        const iconExists = async (iconPath: string) => {
            let networkData: NetworkData;

            try {
                networkData = await context.fetchContent(iconPath);
            } catch (e) {
                debug(`Failed to fetch the ${iconPath} file`);
                const message = `Icon could not be fetched (request failed).`;

                context.report(iconPath, message);

                return null;
            }
            const response = networkData.response;

            if (response.statusCode !== 200) {
                const message = `Icon could not be fetched (status code:
                                    ${response.statusCode}).`;

                context.report(iconPath, message);

                return null;
            }

            return response.body.rawContent;
        };
        /**
         * Passes only for the PNG files
         * @param rawContent raw datastream
         * @param iconPath icon resource path
         */
        const validateImageType = (iconType: string | undefined, rawContent: Buffer, iconPath: string) => {
            const allowedTypes = ['png', 'jpg'];

            if (iconType === undefined) {
                const message = `Icon type was not specifed`;

                context.report(iconPath, message);

                return false;
            }

            const specifiedType = iconType.split('/')[1];

            /** Handling for the corrupt rawContent */
            if (rawContent !== null) {
                const image: ImageTypeResult | null = imageType(rawContent);

                if (image !== null) {
                    const isValidType: boolean = allowedTypes.some((item) => {
                        return item === image.ext;
                    });

                    if (specifiedType !== image.ext) {
                        const message = `Real image type (${image.ext} )
                                    do not match with specified sizes (${specifiedType})`;

                        context.report(iconPath, message);
                    }

                    if (isValidType) {
                        return true;
                    }
                }

                const message = `'Icon should be a valid image type
                                        ${JSON.stringify(allowedTypes)}`;

                context.report(iconPath, message);

                return false;
            }

            return false;
        };

        const validateSizes = (iconSizes: string | undefined, iconRawData: Buffer, iconPath: string) => {
            if (iconSizes === undefined) {
                context.report(iconPath, `Sizes not specifed for icon`);

                return;
            }
            /**
             * sizes can be the string 'any' OR
             * two non-negative integers without leading 0s and separated by 'x' like 144x144
             */
            if (iconSizes === 'any') {
                return;
            }
            const specifiedSize = iconSizes.split('x');

            const realImage = getImageData(iconRawData);

            const realSize = [realImage.width.toString(), realImage.height.toString()];

            const sizesMatch = JSON.stringify(specifiedSize) === JSON.stringify(realSize);

            if (!sizesMatch) {
                const message = `Real image size (${JSON.stringify(realSize)})
                                    do not match with specified size (${specifiedSize})`;

                context.report(iconPath, message);
            }
        };

        /**
         *
         * @param icons array of the icons properties
         * @param hostnameWithProtocol
         */
        const validateIcons = async (icons: ManifestImageResource[], hostnameWithProtocol: string) => {
            for (const icon of icons) {
                const fullIconPath = getIconFullPath(icon.src, hostnameWithProtocol);

                const iconRawData = await iconExists(fullIconPath);

                if (iconRawData !== null) {
                    const validImageType = await validateImageType(icon.type, iconRawData, fullIconPath);

                    if (validImageType) {
                        await validateSizes(icon.sizes, iconRawData, fullIconPath);
                    }
                }
            }
        };

        const validate = async (parseEnd: ManifestParsed) => {
            const {
                parsedContent: { icons },
                resource
            } = parseEnd;
            const resourceURL = new URL(resource);
            const hostnameWithProtocol = `${resourceURL.protocol}//${resourceURL.host}`;

            debug(`Validating hint manifest-icon`);
            /**
             * console.log(`\n--------
             * ${JSON.stringify(hostnameWithProtocol, null, '\t')}
             *--------`);
             */

            if (icons !== undefined) {
                // const fullIconsPath = getIconsFullPath(icons, hostnameWithProtocol);

                debug(`Validating if manifest-icon file exists`);
                await validateIcons(icons, hostnameWithProtocol);
            } else {
                context.report(resource, 'Icons was found to be undefined.');
            }
        };

        context.on('parse::end::manifest', validate);
    }
}
