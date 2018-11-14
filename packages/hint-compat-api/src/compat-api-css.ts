/**
 * @fileoverview Hint to validate if the HTML, CSS and JS APIs of the project are deprecated or not broadly supported
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
            description: `Hint to validate if the CSS features of the project are deprecated`
        },
        id: 'compat-api-css',
        schema: [],
        scope: HintScope.any
    }

    public constructor(context: HintContext) {

        const testFeatureIsSupportedInBrowser = (browsersToSupport: BrowserSupportCollection, browserToSupportName: string, browserInfo: any, featureName: string, prefix?: string, location?: ProblemLocation): void => {
            if(!compatApi.isBrowserToSupportPartOfBrowsersColletcion(browsersToSupport, browserToSupportName)) {
                return;
            }

            const browserFeatureSupported = compatApi.getSupportStatementFromInfo(browserInfo, prefix);

            if (!browserFeatureSupported) {
                const message = `${featureName} of CSS was never supported on any of your browsers to support.`;

                compatCSS.reportIfThereIsNoInformationAboutCompatibility(message, browsersToSupport, browserToSupportName, featureName, location)

                return;
            }

            testRemovedVersionByBrowsers(browsersToSupport, browserFeatureSupported, browserToSupportName, featureName, location, prefix);
        };

        const testRemovedVersionByBrowsers = (browsersToSupport: BrowserSupportCollection, browserFeatureSupported: SimpleSupportStatement, browserToSupportName: string, featureName: string, location?: ProblemLocation, prefix?: string): void => {
            const removedVersion = browserFeatureSupported.version_removed;

            // If there is no removed version, it is not deprecated.
            if (!removedVersion) {
                return;
            }

            // Not a common case, but if removed version is exactly true, is always deprecated.
            if (removedVersion === true) {
                const message = `${featureName} of CSS is not supported on ${browserToSupportName} browser.`;
                compatCSS.reportError(featureName, message, location);

                return;
            }

            testNotSupportedVersionsByBrowsers(browsersToSupport, removedVersion, browserToSupportName, featureName, location, prefix);
        }

        const testNotSupportedVersionsByBrowsers = (browsersToSupport: BrowserSupportCollection, removedVersion: string, browserToSupportName: string, featureName: string, location?: ProblemLocation, prefix?: string): void => {
            const removedVersionNumber = browserVersions.normalize(removedVersion);

            const notSupportedVersions = getNotSupportedVersionByBrowsers(browsersToSupport, browserToSupportName, removedVersionNumber);

            if (notSupportedVersions.length > 0) {
                const usedPrefix = prefix ? `prefixed with ${prefix} ` : '';
                const message = `${featureName} ${usedPrefix ? usedPrefix : ''}is not supported on ${notSupportedVersions.join(', ')} browsers.`;

                compatCSS.reportError(featureName, message, location);
            }
        }

        const getNotSupportedVersionByBrowsers = (browsersToSupport: BrowserSupportCollection, browserToSupportName: string, removedVersionNumber: number): string[] => {
            let notSupportedVersions: string[] = [];

            Object.entries(browsersToSupport).forEach(([browserName, versions]) => {
                if (browserName !== browserToSupportName) {
                    return;
                }

                versions.forEach((version) => {
                    if (version < removedVersionNumber) {
                        return '';
                    }

                    notSupportedVersions.push(`${browserName} ${browserVersions.deNormalize(version)}`);
                });
            });

            return notSupportedVersions
        }

        const onParseCSS = (styleParse: StyleParse): void => {
            const { resource } = styleParse;

            compatCSS.setResource(resource);
            compatCSS.searchCSSFeatures(compatApi.compatDataApi, mdnBrowsersCollection, styleParse);
        };

        const mdnBrowsersCollection = userBrowsers.convert(context.targetedBrowsers);
        const compatApi = new CompatApi('css', mdnBrowsersCollection);
        const compatCSS = new CompatCSS(context, testFeatureIsSupportedInBrowser);

        context.on('parse::css::end', onParseCSS);
    }
}
