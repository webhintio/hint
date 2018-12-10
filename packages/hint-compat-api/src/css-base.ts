import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint } from 'hint/dist/src/lib/types';
import { StyleParse, StyleEvents } from '@hint/parser-css/dist/src/types';
import { CompatApi, CompatCSS } from './helpers';
import { FeatureInfo, BrowsersInfo, SupportStatementResult } from './types';
import { SimpleSupportStatement, VersionValue, SupportBlock, SupportStatement } from './types-mdn.temp';

import { browserVersions } from './helpers/normalize-version';
import { CSSFeatureStatus } from './enums';

export default abstract class BaseCompatApiCSS implements IHint {
    private readonly statusName: CSSFeatureStatus;
    private compatApi: CompatApi;
    private compatCSS: CompatCSS;

    abstract getFeatureVersionValueToAnalyze(browserFeatureSupported: SimpleSupportStatement): VersionValue;
    abstract isSupportedVersion(browser: BrowsersInfo, feature: FeatureInfo, currentVersion: number, version: number): boolean;
    abstract isVersionValueSupported(version: VersionValue): boolean;
    abstract isVersionValueTestable(version: VersionValue): boolean;

    public constructor(context: HintContext<StyleEvents>, statusName: CSSFeatureStatus, isCheckingNotBroadlySupported: boolean) {
        this.compatApi = new CompatApi('css', context, isCheckingNotBroadlySupported);
        this.compatCSS = new CompatCSS(context, this.testFeatureIsSupported.bind(this));
        this.statusName = statusName;

        context.on('parse::end::css', this.onParseCSS.bind(this));
    }

    private async onParseCSS(styleParse: StyleParse): Promise<void> {
        const { resource } = styleParse;

        this.compatCSS.setResource(resource);
        await this.compatCSS.searchCSSFeatures(this.compatApi.compatDataApi, styleParse);
    }

    private async testFeatureIsSupported(feature: FeatureInfo, supportBlock: SupportBlock): Promise<void> {
        const browsersToSupport = Object.entries(supportBlock).filter(([browserName]: [string, SupportStatement]): boolean => {
            return this.compatApi.isBrowserIncludedInCollection(browserName);
        });

        const groupedSupportByBrowser = browsersToSupport.reduce((group, browserInfo) => {
            return this.groupSupportStatementByBrowser(feature, group, browserInfo);
        }, {});

        const supportStatementResult: SupportStatementResult = {
            browsersToSupportCount: browsersToSupport.length,
            groupedBrowserSupport: groupedSupportByBrowser,
            notSupportedBrowsersCount: Object.keys(groupedSupportByBrowser).length
        };

        const hasImcompatibleBrowsers = supportStatementResult.notSupportedBrowsersCount > 0;

        if (!hasImcompatibleBrowsers) {
            return;
        }

        const message = this.generateReportErrorMessage(feature, supportStatementResult);

        await this.compatCSS.reportError(feature, message);
    }

    private groupSupportStatementByBrowser(feature: FeatureInfo, group: { [browserName: string]: string[] }, browserInfo: [string, SupportStatement]) {
        const [browserName, supportStatement] = browserInfo;
        const browserFeature = this.compatApi.getSupportStatementFromInfo(supportStatement, feature.prefix);
        const browser: BrowsersInfo = { name: browserName, supportStatement };
        const versions = browserFeature && this.getNotSupportedBrowser(browser, feature, browserFeature);

        if (!versions) {
            return group;
        }

        return { ...group, [browserName]: versions };
    }

    private getNotSupportedBrowser(browser: BrowsersInfo, feature: FeatureInfo, browserFeatureSupported: SimpleSupportStatement): string[] | null {
        const version = this.getFeatureVersionValueToAnalyze(browserFeatureSupported);

        if (!this.isVersionValueTestable(version)) {
            return null;
        }

        return this.isVersionValueSupported(version) ?
            this.getNotSupportedBrowserVersions(browser, feature, version as string) : [];
    }

    private getNotSupportedBrowserVersions(browser: BrowsersInfo, feature: FeatureInfo, version: string): string[] | null {
        const notSupportedVersions = this.getNotSupportedVersions(browser, feature, version);

        if (notSupportedVersions.length === 0) {
            return null;
        }

        return this.formatNotSupportedVersions(browser.name, notSupportedVersions);
    }

    private getNotSupportedVersions(browser: BrowsersInfo, feature: FeatureInfo, version: string): number[] {
        const versions = this.compatApi.getBrowserVersions(browser.name);
        const currentVersion = browserVersions.normalize(version);

        return versions.filter((version: number) => {
            return !this.isSupportedVersion(browser, feature, currentVersion, version);
        });
    }

    private formatNotSupportedVersions(browserName: string, versions: number[]): string[] {
        return versions.map((version: number) => {
            return `${browserName} ${browserVersions.deNormalize(version)}`;
        });
    }

    private generateReportErrorMessage(feature: FeatureInfo, supportStatementResult: SupportStatementResult): string {
        const { groupedBrowserSupport, browsersToSupportCount, notSupportedBrowsersCount } = supportStatementResult;

        if (notSupportedBrowsersCount > 1 && notSupportedBrowsersCount === browsersToSupportCount) {
            return this.getNotSupportedBrowserMessage(feature);
        } else if (notSupportedBrowsersCount === 1) {
            const browserName = Object.keys(groupedBrowserSupport)[0];
            const versions = groupedBrowserSupport[browserName];

            if (versions.length > 0) {
                return this.getNotSupportedFeatureMessage(feature, groupedBrowserSupport, this.statusName);
            }
        }

        return this.getNotSupportedFeatureMessage(feature, groupedBrowserSupport);
    }

    private getNotSupportedBrowserMessage(feature: FeatureInfo): string {
        return `${feature.name} was never supported on any of your browsers to support.`;
    }

    private getNotSupportedFeatureMessage(feature: FeatureInfo, groupedBrowserSupport: {[browserName: string]: string[]}, action: CSSFeatureStatus = CSSFeatureStatus.Supported): string {
        const stringifiedBrowserInfo = this.stringifyBrowserInfo(groupedBrowserSupport);
        const usedPrefix = feature.prefix ? `prefixed with ${feature.prefix} ` : '';

        return `${feature.name} ${usedPrefix ? usedPrefix : ''}is not ${action} on ${stringifiedBrowserInfo} browser${this.hasMultipleBrowsers(stringifiedBrowserInfo) ? 's' : ''}.`;
    }

    private hasMultipleBrowsers(message: string) {
        return message.includes(',') || message.includes('-');
    }

    private stringifyBrowserInfo(groupedSupportByBrowser: {[browserName: string]: string[]}, skipBrowserVerions: boolean = false) {
        return Object.entries(groupedSupportByBrowser)
            .map(([browserName, browserVersions]: [string, string[]]) => {
                return browserVersions.length === 0 || skipBrowserVerions ?
                    [browserName] :
                    this.compatApi.groupNotSupportedVersions(browserVersions);
            })
            .join(', ');
    }
}
