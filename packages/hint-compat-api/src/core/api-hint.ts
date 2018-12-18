import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint } from 'hint/dist/src/lib/types';
import { StyleParse, StyleEvents } from '@hint/parser-css/dist/src/types';
import { CompatAPI, CompatCSS, CompatHTML, userBrowsers } from '../helpers';
import { FeatureInfo, BrowsersInfo, SupportStatementResult, MDNTreeFilteredByBrowsers } from '../types';
import { SimpleSupportStatement, VersionValue, SupportBlock, SupportStatement, CompatStatement } from '../types-mdn.temp';

import { browserVersions } from '../helpers/normalize-version';
import { HTMLParse, HTMLEvents } from '../../../parser-html/dist/src/types';
import { CompatNamespace } from '../enums';

export interface ICompatLibrary {
    setResource(resource: string): void;
    searchFeatures(collection: MDNTreeFilteredByBrowsers, parse: HTMLParse | StyleParse): void;
    reportError(feature: FeatureInfo, message: string): Promise<void>;
}

const classesMapping: {[key: string]: any} = {
    css: CompatCSS,
    html: CompatHTML
};

export abstract class APIHint implements IHint {
    private compatApi: CompatAPI;
    private compatLibrary: ICompatLibrary;

    abstract getFeatureVersionValueToAnalyze(browserFeatureSupported: SimpleSupportStatement): VersionValue;
    abstract isSupportedVersion(browser: BrowsersInfo, feature: FeatureInfo, currentVersion: number, version: number): boolean;
    abstract isVersionValueSupported(version: VersionValue): boolean;
    abstract isVersionValueTestable(version: VersionValue): boolean;
    abstract getContextualMessage(needContextMessage: boolean): string;

    public constructor(namespaceName: CompatNamespace, context: HintContext<StyleEvents | HTMLEvents>, isCheckingNotBroadlySupported: boolean) {
        const mdnBrowsersCollection = userBrowsers.convert(context.targetedBrowsers);

        this.compatApi = new CompatAPI(namespaceName, mdnBrowsersCollection, isCheckingNotBroadlySupported);
        this.compatLibrary = new classesMapping[namespaceName](context, this.testFeatureIsSupported.bind(this));

        context.on(`parse::end::${namespaceName}` as any, this.onParse.bind(this));
    }

    private async onParse(parse: StyleParse | HTMLParse): Promise<void> {
        const { resource } = parse;

        this.compatLibrary.setResource(resource);
        await this.compatLibrary.searchFeatures(this.compatApi.compatDataApi, parse);
    }

    private async testFeatureIsSupported(feature: FeatureInfo, collection: CompatStatement | undefined): Promise<void> {
        // Check for each browser the support block
        const supportBlock: SupportBlock = this.compatApi.getSupportBlock(collection, feature);

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

        const hasIncompatibleBrowsers = supportStatementResult.notSupportedBrowsersCount > 0;

        if (!hasIncompatibleBrowsers) {
            return;
        }

        const message = this.generateReportErrorMessage(feature, supportStatementResult);

        await this.compatLibrary.reportError(feature, message);
    }

    private groupSupportStatementByBrowser(feature: FeatureInfo, group: { [browserName: string]: string[] }, browserInfo: [string, SupportStatement]) {
        const [name, supportStatement] = browserInfo;
        const browser: BrowsersInfo = { name, supportStatement };
        const prefix = feature.subFeature ? feature.subFeature.prefix : feature.prefix;
        const browserFeature = this.compatApi.getSupportStatementFromInfo(supportStatement, prefix);
        const versions = browserFeature && this.getNotSupportedBrowser(browser, feature, browserFeature);

        if (!versions) {
            return group;
        }

        return { ...group, [name]: versions };
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
        let needContextMessage = false;

        if (notSupportedBrowsersCount > 1 && notSupportedBrowsersCount === browsersToSupportCount) {
            return this.getNotSupportedBrowserMessage(feature);
        } else if (notSupportedBrowsersCount === 1) {
            const browserName = Object.keys(groupedBrowserSupport)[0];
            const versions = groupedBrowserSupport[browserName];

            needContextMessage = versions.length > 0;
        }

        return this.getNotSupportedFeatureMessage(feature, groupedBrowserSupport, needContextMessage);
    }

    private getNotSupportedBrowserMessage(feature: FeatureInfo): string {
        return `${feature.displayableName} is not supported on any of your target browsers.`;
    }

    private getNotSupportedFeatureMessage(feature: FeatureInfo, groupedBrowserSupport: {[browserName: string]: string[]}, needContextMessage: boolean): string {
        const stringifiedBrowserInfo = this.stringifyBrowserInfo(groupedBrowserSupport);
        const usedPrefix = feature.prefix ? `prefixed with ${feature.prefix} ` : '';
        const contextualMessage = this.getContextualMessage(needContextMessage);

        return `${feature.displayableName} ${usedPrefix ? usedPrefix : ''}is not ${contextualMessage} on ${stringifiedBrowserInfo} browser${this.hasMultipleBrowsers(stringifiedBrowserInfo) ? 's' : ''}.`;
    }

    protected hasMultipleBrowsers(message: string) {
        return message.includes(',') || message.includes('-');
    }

    protected stringifyBrowserInfo(groupedSupportByBrowser: {[browserName: string]: string[]}, skipBrowserVerions: boolean = false) {
        return Object.entries(groupedSupportByBrowser)
            .map(([browserName, browserVersions]: [string, string[]]) => {
                return browserVersions.length === 0 || skipBrowserVerions ?
                    [browserName] :
                    this.compatApi.groupNotSupportedVersions(browserVersions);
            })
            .join(', ');
    }
}
