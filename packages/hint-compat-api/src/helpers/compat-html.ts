/**
 * @fileoverview Helper that contains all the logic related with HTML compat api, to use in different modules.
 */

import { MDNTreeFilteredByBrowsers, TestFeatureFunction, FeatureInfo } from '../types';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { ElementFound, IAsyncHTMLElement, ProblemLocation } from 'hint/dist/src/lib/types';
import { SupportBlock } from '../types-mdn.temp';
import { CachedCompatFeatures } from './cached-compat-features';
import { HTMLParse } from '../../../parser-html/dist/src/types';

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

    public async searchHTMLFeatures(data: MDNTreeFilteredByBrowsers, parser: HTMLParse): Promise<void> {
        await this.walk(async (elementFound: ElementFound) => {
            const { element } = elementFound;
            const location = element.getLocation();

            await this.testElement(element, data, location);
        });
    }

    private async testElement(element: IAsyncHTMLElement, data: MDNTreeFilteredByBrowsers, location: ProblemLocation | null): Promise<void> {
        const supportBlock: SupportBlock = this.getSupportBlock(element, data);

        const feature: FeatureInfo = {
            info: supportBlock,
            location: location || undefined,
            name: element.nodeName
        };

        if (this.cachedFeatures.has(feature)) {
            return;
        }

        this.cachedFeatures.add(feature);

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

    // DUPLICATED
    public async reportError(feature: FeatureInfo, message: string): Promise<void> {
        const { location } = feature;

        await this.hintContext.report(this.hintResource, message, { location });
    }
}
