/**
 * @fileoverview Checks usage of Web App Manifest icons
 */
import { URL } from 'url';
import * as getImageData from 'image-size';
import imageType from 'image-type';
import { IHint, NetworkData, HintContext } from 'hint';
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
        /**
         * See if the `icon` file actually
         * exists and is accessible.
         */
        const iconExists = async (iconPath: string): Promise<Buffer | null> => {
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
                const message = `Icon could not be fetched (status code: ${response.statusCode}).`;

                context.report(iconPath, message);

                return null;
            }

            return response.body.rawContent;
        };
        /**
         * Passes only for the PNG files
         * @param iconType type specified in the manifest file
         * @param rawContent raw datastream
         * @param iconPath icon resource path
         */
        const validateImageType = (iconType: string | undefined, rawContent: Buffer, iconPath: string): boolean => {
            const allowedTypes = ['png', 'jpg'];

            if (iconType === undefined) {
                const message = `Icon type was not specifed`;

                context.report(iconPath, message);

                return false;
            }

            const specifiedType = iconType.split('/')[1];

            /** Handling for the corrupt rawContent */
            if (rawContent) {
                const image = imageType(rawContent);

                if (image) {
                    const isValidType = allowedTypes.includes(image.ext);

                    if (specifiedType !== image.ext) {
                        const message = `Real image type (${image.ext}) do not match with specified type (${specifiedType})`;

                        context.report(iconPath, message);
                    }

                    if (isValidType) {
                        return true;
                    }
                }

                const message = `Icon should be a valid image type ${JSON.stringify(allowedTypes)}`;

                context.report(iconPath, message);

                return false;
            }

            return false;
        };

        /**
         *
         * @param iconSizes Sizes specified in the manifest file
         * @param iconRawData
         * @param iconPath full path to the icon file
         */
        const validateSizes = (iconSizes: string | undefined, iconRawData: Buffer, iconPath: string): boolean => {
            if (!iconSizes) {
                context.report(iconPath, `Sizes not specifed for icon`);

                return false;
            }

            /**
             * sizes can be the string 'any' OR
             * two non-negative integers without leading 0s and separated by 'x' like 144x144
             */
            if (iconSizes === 'any') {
                return false;
            }

            const specifiedSize = iconSizes.split('x');
            const realImage = getImageData(iconRawData);
            const specifiedWidth = parseInt(specifiedSize[0]);
            const specifiedHeight = parseInt(specifiedSize[1]);
            const sizesMatch = specifiedWidth === realImage.width && specifiedHeight === realImage.height;

            if (!sizesMatch) {
                const message = `Real image size (${realImage.width}x${realImage.height}) do not match with specified size (${specifiedSize})`;

                context.report(iconPath, message);

                return false;
            }

            return true;
        };

        const hasRequiredSizes = (validSizes: string[], icons: string) => {
            const requiredSizes = ['192x192', '512x512'];
            const requiredSizesNotFound = requiredSizes.filter((size) => {
                return !validSizes.includes(size);
            });

            if (requiredSizesNotFound.length > 0) {
                const message = `Required sizes ${JSON.stringify(requiredSizesNotFound)} not found.`;

                context.report(icons, message);
            }
        };

        /**
         *
         * @param icons array of the icons properties
         * @param hostnameWithProtocol
         */
        const validateIcons = async (icons: ManifestImageResource[], hostnameWithProtocol: string): Promise<string[]> => {
            const validSizes: string[] = [];

            for (const icon of icons) {
                const fullIconPath = `${hostnameWithProtocol}/${icon.src}`;
                const iconRawData = await iconExists(fullIconPath);

                if (iconRawData) {
                    const validImageType = validateImageType(icon.type, iconRawData, fullIconPath);

                    if (validImageType) {
                        const validIconSizes = validateSizes(icon.sizes, iconRawData, fullIconPath);

                        if (validIconSizes && icon.sizes) {
                            validSizes.push(icon.sizes);
                        }
                    }
                }
            }

            debug(`Found ValidSizes: ${validSizes}`);

            return validSizes;
        };

        const validate = async ({ parsedContent: { icons }, resource }: ManifestParsed) => {
            const resourceURL = new URL(resource);
            const hostnameWithProtocol = `${resourceURL.protocol}//${resourceURL.host}`;

            debug(`Validating hint manifest-icon`);

            if (icons && icons.length > 0) {
                debug(`Validating if manifest-icon file exists`);
                const validSizes = await validateIcons(icons, hostnameWithProtocol);

                if (validSizes.length > 0) {
                    hasRequiredSizes(validSizes, resource);
                }
            } else {
                context.report(resource, 'Valid icons property was not found.');
            }
        };

        context.on('parse::end::manifest', validate);
    }
}
