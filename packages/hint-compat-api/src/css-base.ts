import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint } from 'hint/dist/src/lib/types';
import { StyleParse, StyleEvents } from '@hint/parser-css/dist/src/types';
import { CompatApi, userBrowsers, CompatCSS } from './helpers';
import { BrowserSupportCollection, FeatureInfo, BrowsersInfo } from './types';
import { SimpleSupportStatement, VersionValue, SupportBlock } from './types-mdn.temp';

import { browserVersions } from './helpers/normalize-version';
import { CSSFeatureStatus } from './enums';

export default abstract class BaseCompatApiCSS implements IHint {
    private mdnBrowsersCollection: BrowserSupportCollection;
    private statusName: CSSFeatureStatus;
    private compatApi: CompatApi;
    private compatCSS: CompatCSS;

    abstract getFeatureVersionValueToAnalyze(browserFeatureSupported: SimpleSupportStatement): VersionValue;
    abstract isSupportedVersion(browser: BrowsersInfo, feature: FeatureInfo, currentVersion: number, version: number): boolean;
    abstract isVersionValueSupported(version: VersionValue): boolean;
    abstract isVersionValueTestable(version: VersionValue): boolean;

    public constructor(context: HintContext<StyleEvents>, statusName: CSSFeatureStatus, isCheckingNotBroadlySupported: boolean) {
        this.mdnBrowsersCollection = userBrowsers.convert(context.targetedBrowsers);
        this.compatApi = new CompatApi('css', this.mdnBrowsersCollection, isCheckingNotBroadlySupported);
        this.compatCSS = new CompatCSS(context, this.testFeatureIsSupported.bind(this));
        this.statusName = statusName;

        context.on('parse::end::css', this.onParseCSS.bind(this));
    }

    private async onParseCSS(styleParse: StyleParse): Promise<void> {
        const { resource } = styleParse;

        this.compatCSS.setResource(resource);
        await this.compatCSS.searchCSSFeatures(this.compatApi.compatDataApi, styleParse);
    }

    private testFeatureIsSupported(feature: FeatureInfo, supportBlock: SupportBlock): void {
        Object
            .entries(supportBlock)
            .filter(([browserName, _]) => {
                return this.compatApi.isBrowserIncludedInCollection(this.mdnBrowsersCollection, browserName);
            })
            .forEach(async ([browserToSupportName, browserInfo]) => {
                const browserFeatureSupported = this.compatApi.getSupportStatementFromInfo(browserInfo, feature.prefix);
                const info: BrowsersInfo = { browserInfo, browserToSupportName };

                if (browserFeatureSupported) {
                    await this.testVersionByBrowsers(info, feature, browserFeatureSupported);
                } else {
                    await this.compatCSS.reportIfThereIsNoInformationAboutCompatibility(feature);
                }
            });
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

    private async testNotSupportedVersionsByBrowsers(browser: BrowsersInfo, feature: FeatureInfo, version: string): Promise<void> {
        const notSupportedVersions: number[] = this.getNotSupportedVersions(browser, feature, version);

        if (notSupportedVersions.length === 0) {
            return;
        }

        const formattedNotSupportedVersions: string[] = this.formatNotSupportedVersions(browser.browserToSupportName, notSupportedVersions);
        const message = this.generateNotSupportedVersionsError(feature, formattedNotSupportedVersions, this.statusName);

        await this.compatCSS.reportError(feature, message);
    }

    private getNotSupportedVersions(browser: BrowsersInfo, feature: FeatureInfo, version: string): number[] {
        const currentVersion = browserVersions.normalize(version);
        const versions: number[] = this.mdnBrowsersCollection[browser.browserToSupportName] || [];

        return versions.filter((version: number) => {
            return !this.isSupportedVersion(browser, feature, currentVersion, version);
        });
    }

    private formatNotSupportedVersions(browserName: string, versions: number[]): string[] {
        return versions.map((version: number) => {
            return `${browserName} ${browserVersions.deNormalize(version)}`;
        });
    }

    private generateNotSupportedVersionsError(feature: FeatureInfo, notSupportedVersions: string[], statusName: string): string {
        const groupedNotSupportedVersions: string[] = this.compatApi.groupNotSupportedVersions(notSupportedVersions);
        const usedPrefix = feature.prefix ? `prefixed with ${feature.prefix} ` : '';

        return `${feature.name} ${usedPrefix ? usedPrefix : ''}is not ${statusName} on ${groupedNotSupportedVersions.join(', ')} browser${notSupportedVersions.length > 1 ? 's' : ''}.`;
    }
}
