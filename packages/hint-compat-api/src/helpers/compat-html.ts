/**
 * @fileoverview Helper that contains all the logic related with HTML compat api, to use in different modules.
 */

import { MDNTreeFilteredByBrowsers, TestFeatureFunction, FeatureInfo } from '../types';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { ElementFound, IAsyncHTMLElement, ProblemLocation, AsyncHTMLAttribute, IAsyncNamedNodeMap } from 'hint/dist/src/lib/types';
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
            /*
             * WORKAROUND: Element listener is being fired twice. The second
             * time the location is not defined so we use this "flag" to
             * discard the second iteration.
             */

            if (!location) {
                return;
            }

            await this.testElement(element, data, location);
            await this.testGlobalAttributes(element, data, location);
        });
    }

    private async testElement(element: IAsyncHTMLElement, data: MDNTreeFilteredByBrowsers, location: ProblemLocation | null): Promise<void> {
        const name = element.nodeName.toLowerCase();
        const elements = data.elements;
        const displayableName = `${name} element`;

        await this.testFeature(name, displayableName, elements, location);
    }

    private async testGlobalAttributes(element: IAsyncHTMLElement, data: MDNTreeFilteredByBrowsers, location: ProblemLocation | null): Promise<void> {
        const namedNodeMap: IAsyncNamedNodeMap = element.attributes;

        for (let index = 0; index < namedNodeMap.length; index++) {
            const attribute: AsyncHTMLAttribute = namedNodeMap[index];
            const globalAttributes = data.global_attributes;
            const name = attribute.name;
            const displayableName = `global attribute ${name}`;

            await this.testFeature(name, displayableName, globalAttributes, location);
        }
    }

    private async testFeature(featureName: string, displayableName: string, collection: any, location: ProblemLocation | null) {
        const supportBlock: SupportBlock = this.getSupportBlock(collection, featureName);

        const feature: FeatureInfo = {
            displayableName,
            info: supportBlock,
            location: location || undefined,
            name: featureName
        };

        if (this.cachedFeatures.has(feature)) {
            return;
        }

        this.cachedFeatures.add(feature);

        await this.testFunction(feature, supportBlock);
    }

    private getSupportBlock(collection: any, featureName: string, subfeatureName?: string): SupportBlock {
        try {
            /**
             * // NOTE:
             * - If feature is not in the filtered by browser data,
             *   that means that is always supported.
             * - If feature does not have compat data, we ignore it.
             */

            return collection[featureName].__compat.support;
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
