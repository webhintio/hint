/**
 * @fileoverview Hint to validate if the CSS features of the project are deprecated
 */

import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint, ProblemLocation } from 'hint/dist/src/lib/types';
import { StyleParse, StyleEvents } from '@hint/parser-css/dist/src/types';
import { CompatApi, userBrowsers, CompatCSS } from './helpers';
import { BrowserSupportCollection } from './types';
import { SimpleSupportStatement, SupportStatement, VersionValue } from './types-mdn.temp';

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
    abstract isVersionFeatureSupported(version: VersionValue): boolean;
    abstract isVersionTestable(version: VersionValue): boolean;
    abstract isSupportedVersion(currentVersion: number, version: number): boolean;

    public constructor(context: HintContext<StyleEvents>, private statusName: CSSFeatureStatus, isCheckingNotBroadlySupported?: boolean) {
        this.mdnBrowsersCollection = userBrowsers.convert(context.targetedBrowsers);
        this.compatApi = new CompatApi('css', this.mdnBrowsersCollection, isCheckingNotBroadlySupported);
        this.compatCSS = new CompatCSS(context, (...params) => {
            this.testFeatureIsSupportedInBrowser(...params);
        });
        
        context.on('parse::end::css', async (styleParse: StyleParse) => {
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

        if (browserFeatureSupported) {
            const version = this.getFeatureVersionValueToAnalyze(browserFeatureSupported);

            if (this.isVersionTestable(version)) {
                if (this.isVersionFeatureSupported(version)) {
                    await this.testNotSupportedVersionsByBrowsers(browsersToSupport, version as string, browserToSupportName, featureName, location, prefix);
                } else {
                    const message = `${featureName} of CSS is not supported on ${browserToSupportName} browser.`;

                    await this.compatCSS.reportError(featureName, message, location);
                }
            }

        } else {
            const message = `${featureName} of CSS was never supported on any of your browsers to support.`;

            await this.compatCSS.reportIfThereIsNoInformationAboutCompatibility(message, browsersToSupport, browserToSupportName, featureName, location);
        }
    }

    protected async testNotSupportedVersionsByBrowsers(browsersToSupport: BrowserSupportCollection, version: string, browserToSupportName: string, featureName: string, location?: ProblemLocation, prefix?: string): Promise<void> {
        const versionNumber = browserVersions.normalize(version);
        const notSupportedVersions: number[] = this.getNotSupportedVersions(browsersToSupport, browserToSupportName, versionNumber);

        if (notSupportedVersions.length === 0) {
            return;
        }

        const formattedNotSupportedVersions: string[] = this.formatNotSupportedVersions(browserToSupportName, notSupportedVersions);
        const message = this.compatCSS.generateNotSupportedVersionsError(featureName, formattedNotSupportedVersions, this.statusName, prefix);

        await this.compatCSS.reportError(featureName, message, location);
    }

    private getNotSupportedVersions(browsersToSupport: BrowserSupportCollection, browserToSupportName: string, currentVersion: number): number[] {
        const isBrowserDefined: boolean = !!browsersToSupport[browserToSupportName];
        const versions: number[] = isBrowserDefined ? browsersToSupport[browserToSupportName] : [];

        return versions.filter((version: number) => !this.isSupportedVersion(currentVersion, version));
    }

    private formatNotSupportedVersions(browserName: string, versions: number[]): string[] {
        return versions.map((version: number) => `${browserName} ${browserVersions.deNormalize(version)}`);
    }
}
