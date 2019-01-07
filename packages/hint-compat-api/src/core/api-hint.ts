import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint, Events, Event } from 'hint/dist/src/lib/types';

import { CompatAPI, CompatCSS, CompatHTML, userBrowsers } from '../helpers';
import { FeatureInfo, BrowsersInfo, SupportStatementResult, ICompatLibrary } from '../types';
import { SimpleSupportStatement, VersionValue, SupportStatement, CompatStatement, StatusBlock } from '../types-mdn.temp';
import { browserVersions } from '../helpers/normalize-version';
import { CompatNamespace } from '../enums';

const classesMapping: {[key: string]: any} = {
    css: CompatCSS,
    html: CompatHTML
};

export abstract class APIHint<T extends Events, K extends Event> implements IHint {
    private compatApi: CompatAPI;
    private compatLibrary: ICompatLibrary<K>;

    abstract getFeatureVersionValueToAnalyze(browserFeatureSupport: SimpleSupportStatement, status: StatusBlock): VersionValue;
    abstract isSupportedVersion(browser: BrowsersInfo, feature: FeatureInfo, currentVersion: number, version: number): boolean;
    abstract isVersionValueSupported(version: VersionValue): boolean;
    abstract isVersionValueTestable(version: VersionValue): boolean;

    public constructor(namespaceName: CompatNamespace, context: HintContext<T>, isCheckingNotBroadlySupported: boolean) {
        const mdnBrowsersCollection = userBrowsers.convert(context.targetedBrowsers);

        this.compatApi = new CompatAPI(namespaceName, mdnBrowsersCollection, isCheckingNotBroadlySupported);
        this.compatLibrary = new classesMapping[namespaceName](context, this.compatApi.compatDataApi, this.testFeatureIsSupported.bind(this));
    }

    private async testFeatureIsSupported(feature: FeatureInfo, collection: CompatStatement): Promise<void> {
        // Check for each browser the support block
        const { support, status } = this.compatApi.getFeatureCompatStatement(collection, feature);

        const browsersToSupport = Object.entries(support).filter(([browserName]: [string, SupportStatement]): boolean => {
            return this.compatApi.isBrowserIncludedInCollection(browserName);
        });

        const groupedSupportByBrowser: { [key: string]: string[] } = browsersToSupport
            .reduce((group, browserSupportStatement) => {
                const [name, supportStatement] = browserSupportStatement;
                const browserInfo: BrowsersInfo = { name, supportStatement };
                const browserSupport = this.getSupportStatementByBrowser(feature, status, browserInfo);

                if (!browserSupport) {
                    return group;
                }

                return { ...group, [name]: browserSupport };
            }, {});

        const supportStatementResult: SupportStatementResult = {
            browsersToSupportCount: browsersToSupport.length,
            notSupportedBrowsers: groupedSupportByBrowser,
            notSupportedBrowsersCount: Object.keys(groupedSupportByBrowser).length
        };

        const hasIncompatibleBrowsers = supportStatementResult.notSupportedBrowsersCount > 0;

        if (!hasIncompatibleBrowsers) {
            return;
        }

        const message = this.generateReportErrorMessage(feature, supportStatementResult);

        await this.compatLibrary.reportError(feature, message);
    }

    private getSupportStatementByBrowser(feature: FeatureInfo, status: StatusBlock, browserInfo: BrowsersInfo): string[] | null {
        const prefix = feature.subFeature ? feature.subFeature.prefix : feature.prefix;
        const browserFeature = this.compatApi.getSupportStatementFromInfo(browserInfo.supportStatement, prefix);

        return browserFeature && this.getBrowserSupport(browserInfo, feature, browserFeature, status);
    }

    /**
     * @method getBrowserSupport
     * Examples:
     * This feature is supported. Output: null.
     * This feature is not supported at all. Output: [].
     * This feature is not supported by these browser versions. Output: ['chrome 67', 'chrome 68', 'chrome 69'].
     */

    private getBrowserSupport(browser: BrowsersInfo, feature: FeatureInfo, browserFeatureSupport: SimpleSupportStatement, status: StatusBlock): string[] | null {
        const version = this.getFeatureVersionValueToAnalyze(browserFeatureSupport, status);

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
        const { notSupportedBrowsers, browsersToSupportCount, notSupportedBrowsersCount } = supportStatementResult;
        const isNotSupportedInAnyTargetBrowser = notSupportedBrowsersCount > 1 && notSupportedBrowsersCount === browsersToSupportCount;

        return isNotSupportedInAnyTargetBrowser ?
            this.getNotSupportedBrowserMessage(feature) :
            this.getNotSupportedMessage(feature, notSupportedBrowsers);
    }

    private getNotSupportedMessage(feature: FeatureInfo, groupedBrowserSupport: {[browserName: string]: string[]}): string {
        const stringifiedBrowserInfo = this.stringifyBrowserInfo(groupedBrowserSupport);
        const usedPrefix = feature.prefix ? ` prefixed with ${feature.prefix}` : '';

        return this.getNotSupportedFeatureMessage(feature.displayableName + usedPrefix, stringifiedBrowserInfo);
    }

    private stringifyBrowserInfo(groupedSupportByBrowser: { [browserName: string]: string[] }) {
        return Object.entries(groupedSupportByBrowser)
            .map(([browserName, browserVersions]: [string, string[]]) => {
                return browserVersions.length === 0 ?
                    [browserName] :
                    this.compatApi.groupNotSupportedVersions(browserVersions);
            })
            .join(', ');
    }

    private getNotSupportedBrowserMessage(feature: FeatureInfo): string {
        return `${feature.displayableName} is not supported by any of your target browsers.`;
    }

    private getNotSupportedFeatureMessage(featureName: string, browserList: string): string {
        return `${featureName} is not supported by ${browserList}.`;
    }
}
