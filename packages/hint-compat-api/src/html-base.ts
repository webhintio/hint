import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint } from 'hint/dist/src/lib/types';
import { HTMLParse, HTMLEvents } from '@hint/parser-html/dist/src/types';
import { CompatApi, userBrowsers, CompatHTML } from './helpers';
import { BrowserSupportCollection, FeatureInfo, BrowsersInfo } from './types';
import { SimpleSupportStatement, SupportBlock, SupportStatement } from './types-mdn.temp';
import { browserVersions } from './helpers/normalize-version';

export default abstract class BaseHTMLHint implements IHint {
    private mdnBrowsersCollection: BrowserSupportCollection;
    private compatApi: CompatApi;
    private compatHTML: CompatHTML;

    public constructor(context: HintContext<HTMLEvents>, isCheckingNotBroadlySupported: boolean) {
        this.mdnBrowsersCollection = userBrowsers.convert(context.targetedBrowsers);
        this.compatApi = new CompatApi('html', context, isCheckingNotBroadlySupported);
        this.compatHTML = new CompatHTML(context, this.testFeatureIsSupported.bind(this));

        context.on('parse::end::html', this.onParseHTML.bind(this));
    }

    private async onParseHTML(htmlParse: HTMLParse): Promise<void> {
        const { resource } = htmlParse;

        this.compatHTML.setResource(resource);
        await this.compatHTML.searchHTMLFeatures(this.compatApi.compatDataApi, this.mdnBrowsersCollection);
    }

    private async testFeatureIsSupported(feature: FeatureInfo, supportBlock: SupportBlock): Promise<void> {
        await Object.entries(supportBlock)
            .filter(([browserName]: [string, SupportStatement]): boolean => {
                return this.compatApi.isBrowserIncludedInCollection(browserName);
            })
            .forEach(async([browserName, supportStatement]) => {
                const browser: BrowsersInfo = {
                    name: browserName,
                    supportStatement
                };

                const browserFeatureSupported = this.compatApi.getSupportStatementFromInfo(browser.supportStatement);

                if (browserFeatureSupported) {
                    await this.testVersionByBrowsers(browser, feature, browserFeatureSupported);
                } else {
                    await this.compatHTML.reportEmptyCompatibilityInfo(feature);
                }
            });
    }

    private async testVersionByBrowsers(browser: BrowsersInfo, feature: FeatureInfo, browserFeatureSupported: SimpleSupportStatement) {
        const version = browserFeatureSupported.version_removed;

        if (!version) {
            return;
        } else if (version !== true) {
            // Not a common case, but if removed version is exactly true, is always deprecated.
            await this.testNotSupportedVersionsByBrowsers(browser, feature, version as string);
        } else {
            await this.compatHTML.reportNotSupportedFeature(browser, feature);
        }
    }

    protected async testNotSupportedVersionsByBrowsers(browser: BrowsersInfo, feature: FeatureInfo, version: string): Promise<void> {
        const notSupportedVersions: number[] = this.getNotSupportedVersions(browser, feature, version);

        if (notSupportedVersions.length === 0) {
            return;
        }

        const formattedNotSupportedVersions: string[] = this.formatNotSupportedVersions(browser.name, notSupportedVersions);

        await this.compatHTML.reportNotSupportedVersionFeature(feature, formattedNotSupportedVersions, 'supported');
    }

    private formatNotSupportedVersions(browserName: string, versions: number[]): string[] {
        return versions.map((version: number) => {
            return `${browserName} ${browserVersions.deNormalize(version)}`;
        });
    }

    private getNotSupportedVersions(browser: BrowsersInfo, feature: FeatureInfo, version: string): number[] {
        const currentVersion = browserVersions.normalize(version);
        const versions: number[] = this.compatApi.getBrowserVersions(browser.name);

        return versions.filter((version: number) => {
            return version >= currentVersion;
        });
    }
}
