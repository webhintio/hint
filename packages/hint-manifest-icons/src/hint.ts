/**
 * @fileoverview Checks usage of Web App Manifest icons
 */
import { URL } from 'url';
import * as getImageData from 'image-size';
import imageType from 'image-type';
import { IHint, NetworkData, HintContext, ProblemLocation, IJSONLocationFunction } from 'hint';
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
        const iconExists = async (iconPath: string, resource: string, index: number, getLocation: IJSONLocationFunction): Promise<{ iconRawData: Buffer | null; mediaType: string }> => {
            let networkData: NetworkData;

            const iconSrcLocation = getLocation(`icons[${index}].src`);

            try {
                networkData = await context.fetchContent(iconPath);
            } catch (e) {
                debug(`Failed to fetch the ${iconPath} file`);
                const message = `Icon could not be fetched (request failed).`;

                context.report(resource, message, { location: iconSrcLocation });

                return {
                    iconRawData: null,
                    mediaType: ''
                };
            }
            const response = networkData.response;

            if (response.statusCode !== 200) {
                const message = `Icon could not be fetched (status code: ${response.statusCode}).`;

                context.report(resource, message, { location: iconSrcLocation });

                return {
                    iconRawData: null,
                    mediaType: ''
                };
            }

            return {
                iconRawData: response.body.rawContent,
                mediaType: response.mediaType
            };
        };
        /**
         * Passes only for the PNG files
         * @param iconType type specified in the manifest file
         * @param rawContent raw datastream
         * @param iconPath icon resource path
         */
        const validateImageType = (iconType: string | undefined, mediaType: string, rawContent: Buffer, resource: string, index: number, getLocation: IJSONLocationFunction): boolean => {
            const allowedTypes = ['png', 'jpg'];
            const iconTypeLocation = getLocation(`icons[${index}].type`);

            if (!iconType) {
                const message = `Icon type was not specifed`;

                context.report(resource, message, { location: iconTypeLocation });

                return false;
            }

            const specifiedType = iconType.split('/')[1];
            const specifiedMIMEType = mediaType.split('/')[1];

            /** Handling for the corrupt rawContent */
            if (rawContent) {
                const image = imageType(rawContent);

                if (image) {
                    const isValidType = allowedTypes.includes(image.ext);

                    if (specifiedType !== image.ext) {
                        const message = `Real image type (${image.ext}) do not match with specified type (${specifiedType})`;

                        context.report(resource, message, { location: iconTypeLocation });
                    } else if (specifiedType !== specifiedMIMEType) {
                        const message = `MIME type (${specifiedMIMEType}) do not match with specified type (${specifiedType})`;

                        context.report(resource, message, { location: iconTypeLocation });
                    }

                    if (isValidType) {
                        return true;
                    }
                }

                const message = `Icon should be a valid image type ${JSON.stringify(allowedTypes)}`;

                context.report(resource, message, { location: iconTypeLocation });

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
        const validateSizes = (iconSizes: string | undefined, iconRawData: Buffer, resource: string, index: number, getLocation: IJSONLocationFunction): boolean => {
            const iconSizelocation = getLocation(`icons[${index}].sizes`);

            if (!iconSizes) {
                context.report(resource, `Sizes not specifed for icon`, { location: iconSizelocation });

                return false;
            }

            /**
             * sizes can be the string 'any' OR
             * space seperated list of
             * two non-negative integers without leading 0s and separated by 'x' like 144x144
             */
            if (iconSizes === 'any') {
                return false;
            }

            const specifiedSizes = iconSizes.split(' ');
            const realImage = getImageData(iconRawData);

            /**
             * Do not report if one of the specified size match real icon size
             */
            const sizesMatch = specifiedSizes.some((specifiedSize) => {
                const [widthString, heightString] = specifiedSize.split('x');
                const specifiedWidth = parseInt(widthString);
                const specifiedHeight = parseInt(heightString);

                return specifiedWidth === realImage.width && specifiedHeight === realImage.height;
            });

            if (!sizesMatch) {
                const message = `Real image size (${realImage.width}x${realImage.height}) do not match with specified size(s) (${specifiedSizes})`;

                context.report(resource, message, { location: iconSizelocation });

                return false;
            }

            return true;
        };

        const hasRequiredSizes = (validSizes: string[], resource: string, location: ProblemLocation | null) => {
            const requiredSizes = ['192x192', '512x512'];
            const requiredSizesNotFound = requiredSizes.filter((size) => {
                return !validSizes.includes(size);
            });

            if (requiredSizesNotFound.length > 0) {
                const message = `Required sizes ${JSON.stringify(requiredSizesNotFound)} not found.`;

                context.report(resource, message, { location });
            }
        };

        /**
         *
         * @param icons array of the icons properties
         * @param hostnameWithProtocol
         */
        const validateIcons = async (icons: ManifestImageResource[], hostnameWithProtocol: string, resource: string, getLocation: IJSONLocationFunction): Promise<string[]> => {
            const validSizes: string[] = [];

            for (let index = 0; index < icons.length; index++) {
                const icon = icons[index];

                const fullIconPath = `${hostnameWithProtocol}/${icon.src}`;
                const { iconRawData, mediaType } = await iconExists(fullIconPath, resource, index, getLocation);

                if (iconRawData) {
                    const validImageType = validateImageType(icon.type, mediaType, iconRawData, resource, index, getLocation);

                    if (validImageType) {
                        const validIconSizes = validateSizes(icon.sizes, iconRawData, resource, index, getLocation);

                        if (validIconSizes && icon.sizes) {
                            validSizes.push(icon.sizes);
                        }
                    }
                }
            }

            debug(`Found ValidSizes: ${validSizes}`);

            return validSizes;
        };

        const validate = async ({ getLocation, parsedContent: { icons }, resource }: ManifestParsed) => {
            const resourceURL = new URL(resource);
            const hostnameWithProtocol = `${resourceURL.protocol}//${resourceURL.host}`;

            debug(`Validating hint manifest-icon`);

            if (icons && icons.length > 0) {
                debug(`Validating if manifest-icon file exists`);
                const validSizes = await validateIcons(icons, hostnameWithProtocol, resource, getLocation);

                if (validSizes.length > 0) {
                    const iconlocation = getLocation('icons');

                    hasRequiredSizes(validSizes, resource, iconlocation);
                }
            } else {
                const message = `Valid icons property was not found in the web app manifest`;

                context.report(resource, message);
            }
        };

        context.on('parse::end::manifest', validate);
    }
}
