/**
 * @fileoverview Hint to validate if the CSS features of the project are deprecated
 */

import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint } from 'hint/dist/src/lib/types';
import { StyleParse, StyleEvents } from '@hint/parser-css/dist/src/types';
import { CompatApi, userBrowsers, CompatCSS } from './helpers';
import { BrowserSupportCollection, FeatureInfo, BrowserInfo } from './types';
import { SimpleSupportStatement, VersionValue } from './types-mdn.temp';

import meta from './meta/compat-api-css';
import { browserVersions } from './helpers/normalize-version';
import { CSSFeatureStatus } from './enums';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default abstract class BaseCompatApiCSS implements IHint {
    public static readonly meta = meta;

    private mdnBrowsersCollection: BrowserSupportCollection;
    private compatApi: CompatApi;
    private compatCSS: CompatCSS;

    abstract getFeatureVersionValueToAnalyze(browserFeatureSupported: SimpleSupportStatement): VersionValue;
    abstract isVersionValueSupported(version: VersionValue): boolean;
    abstract isVersionValueTestable(version: VersionValue): boolean;
    abstract isSupportedVersion(currentVersion: number, version: number): boolean;
    abstract getStatusNameValue(): CSSFeatureStatus;

    public constructor(context: HintContext<StyleEvents>, isCheckingNotBroadlySupported: boolean) {
        this.mdnBrowsersCollection = userBrowsers.convert(context.targetedBrowsers);
        this.compatApi = new CompatApi('css', this.mdnBrowsersCollection, isCheckingNotBroadlySupported);
        this.compatCSS = new CompatCSS(context, this.testFeatureIsSupportedInBrowser.bind(this));

        context.on('parse::end::css', async (styleParse: StyleParse) => {
            await this.onParseCSS(styleParse);
        });
    }

    private async onParseCSS(styleParse: StyleParse): Promise<void> {
        const { resource } = styleParse;

        this.compatCSS.setResource(resource);
        await this.compatCSS.searchCSSFeatures(this.compatApi.compatDataApi, this.mdnBrowsersCollection, styleParse);
    }

    private async testFeatureIsSupportedInBrowser(browser: BrowserInfo, feature: FeatureInfo): Promise<void> {
        if (!this.compatApi.isBrowserToSupportPartOfBrowsersCollection(browser.browsersToSupport, browser.browserToSupportName)) {
            return;
        }

        const browserFeatureSupported = this.compatApi.getSupportStatementFromInfo(browser.browserInfo, feature.prefix);

        if (browserFeatureSupported) {
            this.testVersionByBrowsers(browser, browserFeatureSupported, feature);
        } else {
            const message = `${feature.featureName} of CSS was never supported on any of your browsers to support.`;

            await this.compatCSS.reportIfThereIsNoInformationAboutCompatibility(message, browser.browsersToSupport, browser.browserToSupportName, feature.featureName, feature.location);
        }
    }

    private async testVersionByBrowsers(browser: BrowserInfo, browserFeatureSupported: SimpleSupportStatement, feature: FeatureInfo) {
        const version = this.getFeatureVersionValueToAnalyze(browserFeatureSupported);

        if (!this.isVersionValueTestable(version)) {
            return;
        }

        if (this.isVersionValueSupported(version)) {
            await this.testNotSupportedVersionsByBrowsers(browser, feature, version as string);
        } else {
            const message = `${feature.featureName} of CSS is not supported on ${browser.browserToSupportName} browser.`;

            await this.compatCSS.reportError(feature.featureName, message, feature.location);
        }
    }

    protected async testNotSupportedVersionsByBrowsers(browser: BrowserInfo, feature: FeatureInfo, version: string): Promise<void> {
        const versionNumber = browserVersions.normalize(version);
        const notSupportedVersions: number[] = this.getNotSupportedVersions(browser, versionNumber);

        if (notSupportedVersions.length === 0) {
            return;
        }

        const statusName = this.getStatusNameValue();
        const formattedNotSupportedVersions: string[] = this.formatNotSupportedVersions(browser.browserToSupportName, notSupportedVersions);
        const message = this.compatCSS.generateNotSupportedVersionsError(feature.featureName, formattedNotSupportedVersions, statusName, feature.prefix);

        await this.compatCSS.reportError(feature.featureName, message, feature.location);
    }

    private getNotSupportedVersions(browser: BrowserInfo, currentVersion: number): number[] {
        const isBrowserDefined: boolean = !!browser.browsersToSupport[browser.browserToSupportName];
        const versions: number[] = isBrowserDefined ? browser.browsersToSupport[browser.browserToSupportName] : [];

        return versions.filter((version: number) => {
            return !this.isSupportedVersion(currentVersion, version);
        });
    }

    private formatNotSupportedVersions(browserName: string, versions: number[]): string[] {
        return versions.map((version: number) => {
            return `${browserName} ${browserVersions.deNormalize(version)}`;
        });
    }
}
