/**
 * @fileoverview Hint to validate if the CSS features of the project are deprecated
 */

import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint, ProblemLocation } from 'hint/dist/src/lib/types';
import { StyleParse } from '@hint/parser-css/dist/src/types';
import { CompatApi, userBrowsers, CompatCSS } from './helpers';
import { BrowserSupportCollection } from './types';
import { SimpleSupportStatement, SupportStatement } from './types-mdn.temp';
import { browserVersions } from './helpers/normalize-version';

import meta from './meta/compat-api-css';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class implements IHint {
    public static readonly meta = meta;

    private mdnBrowsersCollection: BrowserSupportCollection;
    private compatApi: CompatApi;
    private compatCSS: CompatCSS;

    public constructor(context: HintContext) {
        this.mdnBrowsersCollection = userBrowsers.convert(context.targetedBrowsers);
        this.compatApi = new CompatApi('css', this.mdnBrowsersCollection);
        this.compatCSS = new CompatCSS(context, (...params) => {
            this.testFeatureIsSupportedInBrowser(...params);
        });

        context.on('parse::css::end', async (styleParse: StyleParse) => {
            await this.onParseCSS(styleParse);
        });
    }

    private async onParseCSS(styleParse: StyleParse): Promise<void> {
        const { resource } = styleParse;

        this.compatCSS.setResource(resource);
        await this.compatCSS.searchCSSFeatures(this.compatApi.compatDataApi, this.mdnBrowsersCollection, styleParse);
    }

    private async testFeatureIsSupportedInBrowser(browsersToSupport: BrowserSupportCollection, browserToSupportName: string, browserInfo: SupportStatement, featureName: string, prefix?: string, location?: ProblemLocation): Promise<void> {
        if (!this.compatApi.isBrowserToSupportPartOfBrowsersCollection(browsersToSupport, browserToSupportName)) {
            return;
        }

        const browserFeatureSupported = this.compatApi.getSupportStatementFromInfo(browserInfo, prefix);

        if (!browserFeatureSupported) {
            const message = `${featureName} of CSS was never supported on any of your browsers to support.`;

            await this.compatCSS.reportIfThereIsNoInformationAboutCompatibility(message, browsersToSupport, browserToSupportName, featureName, location);

            return;
        }

        await this.testRemovedVersionByBrowsers(browsersToSupport, browserFeatureSupported, browserToSupportName, featureName, location, prefix);
    }

    private async testRemovedVersionByBrowsers(browsersToSupport: BrowserSupportCollection, browserFeatureSupported: SimpleSupportStatement, browserToSupportName: string, featureName: string, location?: ProblemLocation, prefix?: string): Promise<void> {
        const removedVersion = browserFeatureSupported.version_removed;

        // If there is no removed version, it is not deprecated.
        if (!removedVersion) {
            return;
        }

        // Not a common case, but if removed version is exactly true, is always deprecated.
        if (removedVersion === true) {
            const message = `${featureName} of CSS is not supported on ${browserToSupportName} browser.`;

            await this.compatCSS.reportError(featureName, message, location);

            return;
        }

        await this.testNotSupportedVersionsByBrowsers(browsersToSupport, removedVersion, browserToSupportName, featureName, location, prefix);
    }

    private async testNotSupportedVersionsByBrowsers(browsersToSupport: BrowserSupportCollection, removedVersion: string, browserToSupportName: string, featureName: string, location?: ProblemLocation, prefix?: string): Promise<void> {
        const removedVersionNumber = browserVersions.normalize(removedVersion);

        const notSupportedVersions = this.getNotSupportedVersionByBrowsers(browsersToSupport, browserToSupportName, removedVersionNumber);

        if (notSupportedVersions.length > 0) {
            const message = this.compatCSS.generateNotSupportedVersionsError(featureName, notSupportedVersions, 'supported', prefix);

            await this.compatCSS.reportError(featureName, message, location);
        }
    }

    private getNotSupportedVersionByBrowsers(browsersToSupport: BrowserSupportCollection, browserToSupportName: string, removedVersionNumber: number): string[] {
        const notSupportedVersions: string[] = [];

        Object.entries(browsersToSupport).forEach(([browserName, versions]) => {
            if (browserName !== browserToSupportName) {
                return;
            }

            versions.forEach((version) => {
                if (version < removedVersionNumber) {
                    return;
                }

                notSupportedVersions.push(`${browserName} ${browserVersions.deNormalize(version)}`);
            });
        });

        return notSupportedVersions;
    }
}
