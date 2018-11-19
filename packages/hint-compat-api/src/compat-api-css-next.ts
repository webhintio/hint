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
import { SimpleSupportStatement, SupportStatement } from './types-mdn.temp';
import { browserVersions } from './helpers/normalize-version';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

type UserPrefixes = {
    [key: string]: boolean;
};

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

    private mdnBrowsersCollection: BrowserSupportCollection;
    private compatApi: CompatApi;
    private compatCSS: CompatCSS;
    private userPrefixes: UserPrefixes = {};

    public constructor(context: HintContext) {
        const isCheckingNotBroadlySupported = true;

        this.mdnBrowsersCollection = userBrowsers.convert(context.targetedBrowsers);
        this.compatApi = new CompatApi('css', this.mdnBrowsersCollection, isCheckingNotBroadlySupported);
        this.compatCSS = new CompatCSS(context, (...params) => {
            this.testFeatureIsSupportedInBrowser(...params);
        });

        context.on('parse::css::end', (styleParse: StyleParse) => {
            this.onParseCSS(styleParse);
        });
    }

    private onParseCSS(styleParse: StyleParse): void {
        const { resource } = styleParse;

        this.compatCSS.setResource(resource);
        this.compatCSS.searchCSSFeatures(this.compatApi.compatDataApi, this.mdnBrowsersCollection, styleParse);
    }

    private testFeatureIsSupportedInBrowser(browsersToSupport: BrowserSupportCollection, browserToSupportName: string, browserInfo: SupportStatement, featureName: string, prefix?: string, location?: ProblemLocation): void {
        if (!this.compatApi.isBrowserToSupportPartOfBrowsersCollection(browsersToSupport, browserToSupportName)) {
            return;
        }

        const browserFeatureSupported = this.compatApi.getSupportStatementFromInfo(browserInfo, prefix);

        if (!browserFeatureSupported) {
            const message = `${featureName} of CSS was never added on any of your browsers to support.`;

            this.compatCSS.reportIfThereIsNoInformationAboutCompatibility(message, browsersToSupport, browserToSupportName, featureName, location);

            return;
        }

        this.testAddedVersionByBrowsers(browsersToSupport, browserFeatureSupported, browserToSupportName, featureName, location, prefix);
    }

    private testAddedVersionByBrowsers(browsersToSupport: BrowserSupportCollection, browserFeatureSupported: SimpleSupportStatement, browserToSupportName: string, featureName: string, location?: ProblemLocation, prefix?: string): void {
        const addedVersion = browserFeatureSupported.version_added;

        // If there added version is exactly true, always supported
        if (addedVersion === true) {
            return;
        }

        // Not a common case, but if added version does not exist, was not added.
        if (!addedVersion) {
            const message = `${featureName} of CSS is not added on ${browserToSupportName} browser.`;

            this.compatCSS.reportError(featureName, message, location);

            return;
        }

        this.testNotSupportedVersionsByBrowsers(browsersToSupport, addedVersion, browserToSupportName, featureName, location, prefix);
    }

    private testNotSupportedVersionsByBrowsers(browsersToSupport: BrowserSupportCollection, addedVersion: string, browserToSupportName: string, featureName: string, location?: ProblemLocation, prefix?: string): void {
        const addedVersionNumber = browserVersions.normalize(addedVersion);

        const notSupportedVersions = this.getNotSupportedVersionByBrowsers(browsersToSupport, browserToSupportName, addedVersionNumber, featureName, prefix);

        if (notSupportedVersions.length > 0) {
            const usedPrefix = prefix ? `prefixed with ${prefix} ` : '';
            const message = `${featureName} ${usedPrefix ? usedPrefix : ''}is not added on ${notSupportedVersions.join(', ')} browser${notSupportedVersions.length > 1 ? 's' : ''}.`;

            this.compatCSS.reportError(featureName, message, location);
        }
    }

    private getNotSupportedVersionByBrowsers(browsersToSupport: BrowserSupportCollection, browserToSupportName: string, addedVersionNumber: number, featureName: string, prefix?: string): string[] {
        const notSupportedVersions: string[] = [];

        Object.entries(browsersToSupport).forEach(([browserName, versions]) => {
            if (browserName !== browserToSupportName) {
                return;
            }

            // If user used prefixes we should not check for more errors
            if (!prefix && this.checkUserUsedPrefixes(browserName, featureName)) {
                return;
            }

            versions.forEach((version) => {
                if (version >= addedVersionNumber) {
                    if (prefix) {
                        this.addUserUsedPrefixes(browserName, featureName);
                    }

                    return;
                }

                notSupportedVersions.push(`${browserName} ${browserVersions.deNormalize(version)}`);
            });
        });

        return notSupportedVersions;
    }

    private addUserUsedPrefixes(browserName: string, featureName: string): void {
        this.userPrefixes[browserName + featureName] = true;
    }

    private checkUserUsedPrefixes (browserName: string, featureName: string): boolean {
        return this.userPrefixes[browserName + featureName];
    }
}
