/**
 * @fileoverview Hint to validate if the CSS features of the project are deprecated
 */

import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint } from 'hint/dist/src/lib/types';
import { StyleParse, StyleEvents } from '@hint/parser-css/dist/src/types';
import { CompatApi, userBrowsers, CompatCSS } from './helpers';
import { BrowserSupportCollection, FeatureInfo, BrowsersInfo } from './types';
import { SimpleSupportStatement, VersionValue } from './types-mdn.temp';

import { browserVersions } from './helpers/normalize-version';
import { CSSFeatureStatus } from './enums';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default abstract class BaseCompatApiCSS implements IHint {
    private mdnBrowsersCollection: BrowserSupportCollection;
    private compatApi: CompatApi;
    private compatCSS: CompatCSS;

    abstract getFeatureVersionValueToAnalyze(browserFeatureSupported: SimpleSupportStatement): VersionValue;
    abstract isSupportedVersion(browser: BrowsersInfo, feature: FeatureInfo, currentVersion: number, version: number): boolean;
    abstract isVersionValueSupported(version: VersionValue): boolean;
    abstract isVersionValueTestable(version: VersionValue): boolean;
    abstract getStatusNameValue(): CSSFeatureStatus;

    public constructor(context: HintContext<StyleEvents>, isCheckingNotBroadlySupported: boolean) {
        this.mdnBrowsersCollection = userBrowsers.convert(context.targetedBrowsers);
        this.compatApi = new CompatApi('css', this.mdnBrowsersCollection, isCheckingNotBroadlySupported);
        this.compatCSS = new CompatCSS(context, this.testFeatureIsSupportedInBrowser.bind(this));

        context.on('parse::end::css', this.onParseCSS.bind(this));
    }

    private async onParseCSS(styleParse: StyleParse): Promise<void> {
        const { resource } = styleParse;

        this.compatCSS.setResource(resource);
        await this.compatCSS.searchCSSFeatures(this.compatApi.compatDataApi, this.mdnBrowsersCollection, styleParse);
    }

    private async testFeatureIsSupportedInBrowser(browser: BrowsersInfo, feature: FeatureInfo): Promise<void> {
        if (!this.compatApi.isBrowserToSupportPartOfBrowsersCollection(browser.browsersToSupport, browser.browserToSupportName)) {
            return;
        }

        const browserFeatureSupported = this.compatApi.getSupportStatementFromInfo(browser.browserInfo, feature.prefix);

        if (browserFeatureSupported) {
            await this.testVersionByBrowsers(browser, feature, browserFeatureSupported);
        } else {
            const message = `${feature.name} of CSS was never supported on any of your browsers to support.`;

            await this.compatCSS.reportIfThereIsNoInformationAboutCompatibility(browser, feature, message);
        }
    }

    private async testVersionByBrowsers(browser: BrowsersInfo, feature: FeatureInfo, browserFeatureSupported: SimpleSupportStatement) {
        const version = this.getFeatureVersionValueToAnalyze(browserFeatureSupported);

        if (!this.isVersionValueTestable(version)) {
            return;
        }

        if (this.isVersionValueSupported(version)) {
            await this.testNotSupportedVersionsByBrowsers(browser, feature, version as string);
        } else {
            const message = `${feature.name} of CSS is not supported on ${browser.browserToSupportName} browser.`;

            await this.compatCSS.reportError(feature, message);
        }
    }

    protected async testNotSupportedVersionsByBrowsers(browser: BrowsersInfo, feature: FeatureInfo, version: string): Promise<void> {
        const notSupportedVersions: number[] = this.getNotSupportedVersions(browser, feature, version);

        if (notSupportedVersions.length === 0) {
            return;
        }

        const statusName = this.getStatusNameValue();
        const formattedNotSupportedVersions: string[] = this.formatNotSupportedVersions(browser.browserToSupportName, notSupportedVersions);
        const message = this.compatCSS.generateNotSupportedVersionsError(feature.name, formattedNotSupportedVersions, statusName, feature.prefix);

        await this.compatCSS.reportError(feature, message);
    }

    private getNotSupportedVersions(browser: BrowsersInfo, feature: FeatureInfo, version: string): number[] {
        const currentVersion = browserVersions.normalize(version);
        const versions: number[] = browser.browsersToSupport[browser.browserToSupportName] || [];

        return versions.filter((version: number) => {
            return !this.isSupportedVersion(browser, feature, currentVersion, version);
        });
    }

    private formatNotSupportedVersions(browserName: string, versions: number[]): string[] {
        return versions.map((version: number) => {
            return `${browserName} ${browserVersions.deNormalize(version)}`;
        });
    }
}
