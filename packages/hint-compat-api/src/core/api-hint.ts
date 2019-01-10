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

const NOT_FOUND_INDEX = -1;

const DEFAULT_HINT_OPTIONS = {
    enable: [],
    ignore: ['ime-mode'] // Built-in list of ignored features
};

export abstract class APIHint<T extends Events, K extends Event> implements IHint {
    private compatApi: CompatAPI;
    private compatLibrary: ICompatLibrary<K>;
    private pendingReports: [FeatureInfo, SupportStatementResult][] = [];

    abstract getFeatureVersionValueToAnalyze(browserFeatureSupport: SimpleSupportStatement, status: StatusBlock): VersionValue;
    abstract isSupportedVersion(browser: BrowsersInfo, feature: FeatureInfo, currentVersion: number, version: number): boolean;
    abstract isVersionValueSupported(version: VersionValue): boolean;
    abstract isVersionValueTestable(version: VersionValue): boolean;

    public constructor(namespaceName: CompatNamespace, context: HintContext<T>, isCheckingNotBroadlySupported: boolean) {
        const mdnBrowsersCollection = userBrowsers.convert(context.targetedBrowsers);
        const hintOptions = this.prepareHintOptions(context.hintOptions);

        this.compatApi = new CompatAPI(namespaceName, mdnBrowsersCollection, isCheckingNotBroadlySupported, hintOptions.ignore);
        this.compatLibrary = new classesMapping[namespaceName](context, this.compatApi.compatDataApi, this.testFeature.bind(this));

        (context as HintContext<Events>).on('traverse::end', this.consumeReports.bind(this));
    }

    private testFeature(feature: FeatureInfo, collection: CompatStatement): boolean {
        // Check for each browser the support block
        const { support, status } = this.compatApi.getFeatureCompatStatement(collection, feature);

        const browsersToSupport = Object.entries(support).filter(([browserName]: [string, SupportStatement]): boolean => {
            return this.compatApi.isBrowserIncludedInCollection(browserName);
        });

        const groupedSupportByBrowser = browsersToSupport.reduce((group, [name, supportStatement]) => {
            const browserInfo: BrowsersInfo = { name, supportStatement };
            const browserSupport = this.getSupportStatementByBrowser(browserInfo, feature, status);

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

        if (hasIncompatibleBrowsers) {
            this.pendingReports.push([feature, supportStatementResult]);
        }

        return !hasIncompatibleBrowsers;
    }

    private getSupportStatementByBrowser(browser: BrowsersInfo, feature: FeatureInfo, status: StatusBlock): string[] | null {
        const prefix = feature.subFeature ? feature.subFeature.prefix : feature.prefix;
        const browserFeature = this.compatApi.getSupportStatementFromInfo(browser.supportStatement, prefix);

        if (!browserFeature) {
            return null;
        }

        return this.getBrowserSupport(browser, feature, browserFeature, status);
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

    private async consumeReports(): Promise<void> {
        const pendingReportsLength = this.pendingReports.length;
        let fallbackIndex = pendingReportsLength;

        for (let i = 0; i < pendingReportsLength; i = fallbackIndex) {
            const [feature, supportStatementResult] = this.pendingReports[i];

            fallbackIndex = this.getFallbackIndex(feature, i);

            if (fallbackIndex !== NOT_FOUND_INDEX) {
                continue;
            }

            const message = this.generateReportErrorMessage(feature, supportStatementResult);

            await this.compatLibrary.reportError(feature, message);
            fallbackIndex = i + 1;
        }
    }

    private getFallbackIndex(feature: FeatureInfo, index: number): number {
        if (!feature.prefix) {
            return NOT_FOUND_INDEX;
        }

        const pendingReportsLength = this.pendingReports.length;

        for (let i = index + 1; i < pendingReportsLength; i++) {
            const [nextFeature] = this.pendingReports[i];

            if (feature.name !== nextFeature.name) {
                return NOT_FOUND_INDEX;
            } else if (!nextFeature.prefix) {
                return i;
            }
        }

        return NOT_FOUND_INDEX;
    }

    private prepareHintOptions(options: any): any {
        const mergedOptions = Object.assign({}, DEFAULT_HINT_OPTIONS, options);

        if (mergedOptions.enable.length > 0) {
            mergedOptions.ignore = mergedOptions.ignore.filter((featureName: string) => {
                return !mergedOptions.enable.includes(featureName);
            });
        }

        return mergedOptions;
    }
}
