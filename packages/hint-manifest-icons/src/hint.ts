/**
 * @fileoverview Checks usage of Web App Manifest icons
 */
import { URL } from 'url';
import { imageSize as getImageData } from 'image-size';
import imageType from 'image-type';
import { IHint, NetworkData, HintContext } from 'hint';
import { JSONLocationFunction } from '@hint/utils-json';
import { ManifestEvents, ManifestParsed, ManifestImageResource } from '@hint/parser-manifest';
import { ProblemLocation, Severity } from '@hint/utils-types';
import { debug as d } from '@hint/utils-debug';
import { determineMediaTypeBasedOnFileExtension } from '@hint/utils/dist/src/content-type';

import meta from './meta';
import { getMessage } from './i18n.import';
import { extname } from 'path';

const debug: debug.IDebugger = d(__filename);

// Valid values for icon purpose property.
const validPurposes = ['any', 'maskable', 'badge', 'monochrome'];

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
        const iconExists = async (iconPath: string, resource: string, index: number, getLocation: JSONLocationFunction): Promise<{ iconRawData: Buffer | null; mediaType: string } | null> => {
            let networkData: NetworkData;

            const iconSrcLocation = getLocation(`icons[${index}].src`, { at: 'value' });

            try {
                networkData = await context.fetchContent(iconPath);
            } catch (e) {
                debug(`Failed to fetch the ${iconPath} file`);
                const message = getMessage('iconCouldNotBeFetched', context.language);

                context.report(
                    resource,
                    message,
                    { location: iconSrcLocation, severity: Severity.error }
                );

                return null;
            }
            const response = networkData.response;

            if (response.statusCode !== 200) {
                const message = getMessage('iconCouldNotBeFetchedStatusCode', context.language, response.statusCode.toString());

                context.report(
                    resource,
                    message,
                    { location: iconSrcLocation, severity: Severity.error }
                );

                return null;
            }

            return {
                iconRawData: response.body.rawContent,
                mediaType: response.mediaType
            };
        };
        /**
         * Passes only for the PNG files
         * @param icon icon specified in the manifest file
         * @param rawContent raw datastream
         * @param iconPath icon resource path
         */
        const validateImageType = (icon: ManifestImageResource, mediaType: string, rawContent: Buffer | null, resource: string, index: number, getLocation: JSONLocationFunction): boolean => {
            const allowedTypes = ['png', 'jpg'];
            const iconTypeLocation = getLocation(`icons[${index}].type`, { at: 'value' });
            const { src, type: iconType } = icon;

            if (!iconType) {
                const message = getMessage('iconTypeNotSpecified', context.language);
                const iconLocation = getLocation(`icons[${index}]`);

                context.report(
                    resource,
                    message,
                    { location: iconLocation, severity: Severity.error }
                );

                return false;
            }

            const specifiedType = iconType.split('/')[1];
            const specifiedMIMEType = mediaType.split('/')[1];

            let ext = extname(src).replace('.', '');

            /** Handling for the corrupt rawContent */
            if (rawContent) {
                const image = imageType(rawContent);

                if (image) {
                    ext = image.ext;
                }
            }

            const isValidType = allowedTypes.includes(ext);

            if (specifiedType !== ext) {
                const message = getMessage('realImageType', context.language, [ext, specifiedType]);

                context.report(
                    resource,
                    message,
                    { location: iconTypeLocation, severity: Severity.warning }
                );
            } else if (specifiedType !== specifiedMIMEType) {
                const message = getMessage('mimeTypeNotMatch', context.language, [specifiedMIMEType, specifiedType]);

                context.report(
                    resource,
                    message,
                    { location: iconTypeLocation, severity: Severity.warning }
                );
            }


            if (isValidType) {
                return true;
            }

            const message = getMessage('iconShouldBeValidImageType', context.language, JSON.stringify(allowedTypes));

            context.report(
                resource,
                message,
                { location: iconTypeLocation, severity: Severity.error }
            );

            return false;
        };

        /**
         *
         * @param iconSizes Sizes specified in the manifest file
         * @param iconRawData
         * @param iconPath full path to the icon file
         */
        const validateSizes = (iconSizes: string | undefined, iconRawData: Buffer | null, resource: string, index: number, getLocation: JSONLocationFunction): boolean => {
            const iconSizelocation = getLocation(`icons[${index}].sizes`, { at: 'value' });

            if (!iconSizes) {
                context.report(
                    resource,
                    getMessage('sizesNotSpecified', context.language),
                    { location: iconSizelocation, severity: Severity.error }
                );

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

            // Working on local environment so no access to the real image for further checking
            if (!iconRawData) {
                return true;
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

            if (!sizesMatch && realImage.width && realImage.height) {
                const message = getMessage('realImageSizeNotMatch', context.language, [realImage.width.toString(), realImage.height.toString(), specifiedSizes.toString()]);

                context.report(
                    resource,
                    message,
                    { location: iconSizelocation, severity: Severity.warning }
                );

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
                const message = getMessage('requiredSizes', context.language, JSON.stringify(requiredSizesNotFound));

                context.report(
                    resource,
                    message,
                    { location, severity: Severity.error }
                );
            }
        };

        /**
         *
         * @param icons array of the icons properties
         * @param hostnameWithProtocol
         */
        const validateIconsSize = async (icons: ManifestImageResource[], hostnameWithProtocol: string, resource: string, getLocation: JSONLocationFunction): Promise<string[]> => {
            const validSizes: string[] = [];

            for (let index = 0; index < icons.length; index++) {
                const icon = icons[index];

                const fullIconPath = `${hostnameWithProtocol}/${icon.src}`;
                let iconRawData: Buffer | null = null;
                let mediaType = '';


                if (hostnameWithProtocol.startsWith('http')) {
                    const result = await iconExists(fullIconPath, resource, index, getLocation);

                    if (!result) {
                        return validSizes;
                    }

                    iconRawData = result.iconRawData;
                    mediaType = result.mediaType;
                } else {
                    mediaType = determineMediaTypeBasedOnFileExtension(icon.src) || '';
                }

                const validImageType = validateImageType(icon, mediaType, iconRawData, resource, index, getLocation);

                if (validImageType) {
                    const validIconSizes = validateSizes(icon.sizes, iconRawData, resource, index, getLocation);

                    if (validIconSizes && icon.sizes) {
                        validSizes.push(icon.sizes);
                    }
                }
            }


            debug(`Found ValidSizes: ${validSizes}`);

            return validSizes;
        };

        const validateIconsPurpose = (icons: ManifestImageResource[], resource: string, getLocation: JSONLocationFunction) => {
            for (let iconIndex = 0; iconIndex < icons.length; iconIndex++) {
                const icon = icons[iconIndex];

                if (!icon.purpose) {
                    continue;
                }

                const purposes = icon.purpose.split(' ').filter((purpose) => {
                    return purpose;
                });
                const purposesSet = new Set(purposes);

                for (const purpose of purposesSet) {
                    if (!validPurposes.includes(purpose)) {
                        context.report(resource, getMessage('iconPurposeInvalid', context.language, purpose), {
                            location: getLocation(`icons[${iconIndex}].purpose`),
                            severity: Severity.warning
                        });
                    }

                    const purposeIndex = purposes.indexOf(purpose);

                    if (purposeIndex >= 0) {
                        purposes.splice(purposeIndex, 1);
                    }
                }

                if (purposes.length > 0) {
                    context.report(resource, getMessage('iconPurposeDuplicate', context.language, [...(new Set(purposes))].join(' ')), {
                        location: getLocation(`icons[${iconIndex}].purpose`),
                        severity: Severity.hint
                    });
                }
            }
        };

        const validate = async ({ getLocation, parsedContent: { icons }, resource }: ManifestParsed) => {
            const resourceURL = new URL(resource);
            const hostnameWithProtocol = `${resourceURL.protocol}//${resourceURL.host}`;

            debug(`Validating hint manifest-icon`);

            if (icons) {
                if (icons.length > 0) {

                    debug(`Validating if manifest-icon file exists`);
                    const validSizes = await validateIconsSize(icons, hostnameWithProtocol, resource, getLocation);
                    const iconlocation = getLocation('icons');

                    if (validSizes.length > 0) {

                        hasRequiredSizes(validSizes, resource, iconlocation);
                    }

                    validateIconsPurpose(icons, resource, getLocation);
                } else {
                    // Empty array in `icons` property (otherwise the schema will not validate)
                    const message = getMessage('validIconsNotFound', context.language);
                    const location = getLocation('icons');

                    context.report(
                        resource,
                        message,
                        { location, severity: Severity.error }
                    );
                }
            } else {
                const message = getMessage('validIconsNotFound', context.language);

                context.report(resource, message, { severity: Severity.error });
            }
        };

        context.on('parse::end::manifest', validate);
    }
}
