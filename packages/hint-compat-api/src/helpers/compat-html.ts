/**
 * @fileoverview Helper that contains all the logic related with HTML compat api, to use in different modules.
 */

import { MDNTreeFilteredByBrowsers, BrowserSupportCollection, TestFeatureFunction, BrowsersInfo, FeatureInfo, BrowserVersions } from '../types';
import { HintContext, ReportOptions } from 'hint/dist/src/lib/hint-context';
import { ElementFound, IAsyncHTMLElement, /* IAsyncNamedNodeMap, AsyncHTMLAttribute, */ ProblemLocation } from 'hint/dist/src/lib/types';
import { SupportBlock } from '../types-mdn.temp';
import { browserVersions } from './normalize-version';
import { CachedCompatFeatures } from './cached-compat-features';

export class CompatHTML {
    private cachedFeatures: CachedCompatFeatures;
    private testFunction: TestFeatureFunction;
    private hintContext: HintContext;
    private hintResource: string = 'unknown';

    public constructor(hintContext: HintContext, testFunction: TestFeatureFunction) {
        if (!testFunction) {
            throw new Error('You must set test function before test a feature.');
        }

        this.cachedFeatures = new CachedCompatFeatures();
        this.testFunction = testFunction;
        this.hintContext = hintContext;
    }

    public setResource(hintResource: string): void {
        this.hintResource = hintResource;
    }

    public async searchHTMLFeatures(data: MDNTreeFilteredByBrowsers, browsers: BrowserSupportCollection): Promise<void> {
        await this.walk(async (elementFound: ElementFound) => {
            const { element } = elementFound;
            const location = element.getLocation();

            await this.testElement(element, data, browsers, location);
        });
    }

    private async testElement(element: IAsyncHTMLElement, data: MDNTreeFilteredByBrowsers, browsersToSupport: BrowserSupportCollection, location: ProblemLocation | null): Promise<void> {
        if (this.cachedFeatures.isCached(element.nodeName)) {
            await this.cachedFeatures.showCachedErrors(element.nodeName, this.hintContext, location || undefined);

            return;
        }

        this.cachedFeatures.add(element.nodeName);

        const supportBlock: SupportBlock = this.getSupportBlock(element, data);

        const feature: FeatureInfo = {
            info: supportBlock,
            location: location || undefined,
            name: element.nodeName
        };

        await this.testFunction(feature, supportBlock);
    }

    private getSupportBlock(element: IAsyncHTMLElement, data: MDNTreeFilteredByBrowsers): SupportBlock {
        const tagName: string = element.nodeName.toLowerCase();
        const elements: any = data.elements;

        try {
            /**
             * // NOTE:
             * - If feature is not in the filtered by browser data,
             *   that means that is always supported.
             * - If feature does not have compat data, we ignore it.
             */

            return elements[tagName].__compat.support;
        } catch (error) {
            return {} as SupportBlock;
        }
    }

    private async walk(callback: (element: ElementFound) => any): Promise<void> {
        await this.hintContext.on('element::*', callback.bind(this));
    }

    /**
     * FIXME: Probably this method should be globally defined so it can be reused
     */

    private async reportError(message: string, location?: ProblemLocation | null) {
        const options: ReportOptions = {};

        if (location) {
            options.location = location;
        }

        await this.hintContext.report(this.hintResource, message, options);
    }

    public async reportEmptyCompatibilityInfo(feature: FeatureInfo): Promise<void> {
        const message = `${feature.name} of HTML was never supported on any of your browsers to support.`;

        await this.reportError(message);
    }

    public async reportNotSupportedFeature(browser: BrowsersInfo, feature: FeatureInfo): Promise<void> {
        const message = `${feature.name} of HTML is not supported on ${browser.name} browser.`;

        await this.reportError(message);
    }

    public async reportNotSupportedVersionFeature(feature: FeatureInfo, notSupportedVersions: string[], statusName: string): Promise<void> {
        const groupedNotSupportedVersions = this.groupNotSupportedVersions(notSupportedVersions);
        const message = `${feature.name.toLowerCase()} is not ${statusName} on ${groupedNotSupportedVersions.join(', ')} browser${notSupportedVersions.length > 1 ? 's' : ''}.`;

        await this.reportError(message);
    }

    // DUPLICATED
    /**
     * @method groupNotSupportedVersions
     * Examples:
     * [ 'chrome 66', 'chrome 69' ] into ['chrome 66, 69']
     * [ 'chrome 67', 'chrome 68', 'chrome 69' ] into ['chrome 67-69']
     * [ 'chrome 66', 'chrome 68', 'chrome 69' ] into ['chrome 66, 67-69']
     *
     */
    private groupNotSupportedVersions(notSupportedVersions: string[]): string[] {
        if (!notSupportedVersions) {
            return [];
        }

        const browsers: BrowserVersions = {};

        notSupportedVersions.forEach((browserAndVersion: string) => {
            const [browser, version] = browserAndVersion.split(' ');

            browsers[browser] = browsers[browser] || [];
            browsers[browser].push(version);
        });

        const groupedVersions = Object.entries(browsers).map(([browser, versions]) => {
            const sortedVersions = versions.sort();
            let grouped = '';
            let groupStarted = false;

            sortedVersions.forEach((value, i) => {
                const nextValue = sortedVersions[i + 1];
                const nNextValue = nextValue ? browserVersions.normalize(nextValue) : null;
                const nValue = browserVersions.normalize(value);

                if (!groupStarted) {
                    grouped += `${browser} ${value}`;
                }

                if (nNextValue && nNextValue - nValue > browserVersions.unit) {
                    if (groupStarted) {
                        groupStarted = false;
                        grouped += value;
                    }

                    grouped += ', ';
                }

                if (!groupStarted && nNextValue && nNextValue - nValue <= browserVersions.unit) {
                    groupStarted = true;
                    grouped += '-';
                }

                if (groupStarted && !nextValue) {
                    groupStarted = false;
                    grouped += value;
                }
            });

            return grouped;
        });

        return groupedVersions;
    }
}
