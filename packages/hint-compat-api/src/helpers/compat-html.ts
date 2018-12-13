/**
 * @fileoverview Helper that contains all the logic related with HTML compat api, to use in different modules.
 */

import { MDNTreeFilteredByBrowsers, TestFeatureFunction, FeatureInfo } from '../types';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { ElementFound, IAsyncHTMLElement, ProblemLocation, AsyncHTMLAttribute, IAsyncNamedNodeMap } from 'hint/dist/src/lib/types';
import { SupportBlock, Identifier, CompatStatement } from '../types-mdn.temp';
import { HTMLParse } from '../../../parser-html/dist/src/types';
import { get } from 'lodash';
import { CompatBase } from './compat-base';

export class CompatHTML extends CompatBase {
    public constructor(hintContext: HintContext, testFunction: TestFeatureFunction) {
        super(hintContext, testFunction);
    }

    public async searchFeatures(data: MDNTreeFilteredByBrowsers, parser: HTMLParse): Promise<void> {
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

    private async testElement(element: IAsyncHTMLElement, data: MDNTreeFilteredByBrowsers, location: ProblemLocation): Promise<void> {
        const name = element.nodeName.toLowerCase();
        const elements = data.elements;
        const displayableName = `${name} element`;

        await this.testFeature(name, displayableName, elements, location);
    }

    private async testGlobalAttributes(element: IAsyncHTMLElement, data: MDNTreeFilteredByBrowsers, location: ProblemLocation): Promise<void> {
        const namedNodeMap: IAsyncNamedNodeMap = element.attributes;

        for (let index = 0; index < namedNodeMap.length; index++) {
            const attribute: AsyncHTMLAttribute = namedNodeMap[index];
            const globalAttributes = data.global_attributes;
            const name = attribute.name;
            const displayableName = `global attribute ${name}`;

            await this.testFeature(name, displayableName, globalAttributes, location);
        }
    }

    private async testFeature(name: string, displayableName: string, collection: any, location: ProblemLocation) {
        const supportBlock: SupportBlock = this.getSupportBlock(collection, name);

        const feature: FeatureInfo = {
            displayableName,
            location,
            name,
            supportBlock
        };

        if (this.isFeatureAlreadyInUse(feature)) {
            return;
        }

        await this.testFunction(feature, supportBlock);
    }

    private getSupportBlock(collection: CompatStatement | undefined, featureName: string, subfeatureName?: string): SupportBlock {
        try {
            /**
             * // NOTE:
             * - If feature is not in the filtered by browser data,
             *   that means that is always supported.
             * - If feature does not have compat data, we ignore it.
             */

            const accessor = subfeatureName ?
                [featureName, subfeatureName] :
                [featureName];

            const feature: Identifier = get(collection, accessor);

            if (!feature || !feature.__compat) {
                throw new Error('Missing compatibility information');
            }

            return feature.__compat.support;
        } catch (error) {
            return {} as SupportBlock;
        }
    }

    private async walk(callback: (element: ElementFound) => any): Promise<void> {
        await this.hintContext.on('element::*', callback.bind(this));
    }
}
