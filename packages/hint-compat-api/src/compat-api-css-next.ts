/**
 * @fileoverview Hint to validate if the CSS features of the project are not broadly supported
 */

import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint, HintMetadata, ProblemLocation } from 'hint/dist/src/lib/types';
import { StyleParse } from '@hint/parser-css/dist/src/types';
import { CompatApi, userBrowsers, CompatCSS } from './helpers';
import { BrowserSupportCollection } from './types';
import { SimpleSupportStatement } from './types-mdn.temp';
import { browserVersions } from './helpers/normalize-version';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class implements IHint {

    public static readonly meta: HintMetadata = {
        docs: {
            category: Category.interoperability,
            description: `Hint to validate if the CSS features of the project are not broadly supported`
        },
        id: 'compat-api-css-next',
        schema: [],
        scope: HintScope.any
    }

    public constructor(context: HintContext) {

        const testFeatureIsSupportedInBrowser = (browsersToSupport: BrowserSupportCollection, browserToSupportName: string, browserInfo: any, featureName: string, prefix?: string, location?: ProblemLocation): void => {
            if (!compatApi.isBrowserToSupportPartOfBrowsersColletcion(browsersToSupport, browserToSupportName)) {
                return;
            }

            const browserFeatureSupported = compatApi.getSupportStatementFromInfo(browserInfo, prefix);

            if (!browserFeatureSupported) {
                const message = `${featureName} of CSS was never added on any of your browsers to support.`;

                compatCSS.reportIfThereIsNoInformationAboutCompatibility(message, browsersToSupport, browserToSupportName, featureName, location)

                return;
            }

            testAddedVersionByBrowsers(browsersToSupport, browserFeatureSupported, browserToSupportName, featureName, location, prefix);
        };

        const testAddedVersionByBrowsers = (browsersToSupport: BrowserSupportCollection, browserFeatureSupported: SimpleSupportStatement, browserToSupportName: string, featureName: string, location?: ProblemLocation, prefix?: string): void => {
            const addedVersion = browserFeatureSupported.version_added;

            // If there added version is exactly true, always supported
            if (addedVersion === true) {
                return;
            }

            // Not a common case, but if added version does not exist, was not added.
            if (!addedVersion) {
                const message = `${featureName} of CSS is not added on ${browserToSupportName} browser.`;
                compatCSS.reportError(featureName, message, location);

                return;
            }

            testNotSupportedVersionsByBrowsers(browsersToSupport, addedVersion, browserToSupportName, featureName, location, prefix);
        }

        const testNotSupportedVersionsByBrowsers = (browsersToSupport: BrowserSupportCollection, addedVersion: string, browserToSupportName: string, featureName: string, location?: ProblemLocation, prefix?: string): void => {
            const addedVersionNumber = browserVersions.normalize(addedVersion);

            const notSupportedVersions = getNotSupportedVersionByBrowsers(browsersToSupport, browserToSupportName, addedVersionNumber, featureName, prefix);

            if (notSupportedVersions.length > 0) {
                const usedPrefix = prefix ? `prefixed with ${prefix} ` : '';
                const message = `${featureName} ${usedPrefix ? usedPrefix : ''}is not added on ${notSupportedVersions.join(', ')} browsers.`;

                compatCSS.reportError(featureName, message, location);
            }
        }

        const getNotSupportedVersionByBrowsers = (browsersToSupport: BrowserSupportCollection, browserToSupportName: string, addedVersionNumber: number, featureName: string, prefix?: string): string[] => {
            let notSupportedVersions: string[] = [];

            Object.entries(browsersToSupport).forEach(([browserName, versions]) => {
                if (browserName !== browserToSupportName) {
                    return;
                }

                // If user used prefixes we should not check for more errors
                if (!prefix && checkUserUsedPrefixes(browserName, featureName)) {
                    return;
                }

                versions.forEach((version) => {
                    if (version >= addedVersionNumber) {
                        if (prefix) {
                            addUserUsedPrefixes(browserName, featureName);
                        }

                        return;
                    }

                    notSupportedVersions.push(`${browserName} ${browserVersions.deNormalize(version)}`);
                });
            });

            return notSupportedVersions
        }

        const addUserUsedPrefixes = (browserName: string, featureName: string): void => {
            userPrefixes[browserName + featureName] = true;
        };

        const checkUserUsedPrefixes = (browserName: string, featureName: string): boolean => {
            return userPrefixes[browserName + featureName];
        };

        const onParseCSS = (styleParse: StyleParse): void => {
            const { resource } = styleParse;

            compatCSS.setResource(resource);
            compatCSS.searchCSSFeatures(compatApi.compatDataApi, mdnBrowsersCollection, styleParse);
        };

        const mdnBrowsersCollection = userBrowsers.convert(context.targetedBrowsers);
        const userPrefixes: any = {};
        const isCheckingNotBroadlySupported = true;
        const compatApi = new CompatApi('css', mdnBrowsersCollection, isCheckingNotBroadlySupported);
        const compatCSS = new CompatCSS(context, testFeatureIsSupportedInBrowser);

        context.on('parse::css::end', onParseCSS);
    }
}
