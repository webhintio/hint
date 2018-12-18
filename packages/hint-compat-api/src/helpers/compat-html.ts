/**
 * @fileoverview Helper that contains all the logic related with HTML compat api, to use in different modules.
 */

import { MDNTreeFilteredByBrowsers, TestFeatureFunction, FeatureInfo } from '../types';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { ElementFound, IAsyncHTMLElement, ProblemLocation, AsyncHTMLAttribute, IAsyncNamedNodeMap } from 'hint/dist/src/lib/types';
import { CompatStatement } from '../types-mdn.temp';
import { HTMLParse } from '@hint/parser-html/dist/src/types';
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
            await this.testAttributes(element, data, location);
        });
    }

    private async testElement(element: IAsyncHTMLElement, data: MDNTreeFilteredByBrowsers, location: ProblemLocation): Promise<void> {
        const elements = data.elements;
        const elementName = element.nodeName.toLowerCase();

        const feature: FeatureInfo = {
            displayableName: `${elementName} element`,
            location,
            name: elementName
        };

        await this.testFeature(elements, feature);
    }

    private async testAttributes(element: IAsyncHTMLElement, data: MDNTreeFilteredByBrowsers, location: ProblemLocation): Promise<void> {
        const namedNodeMap: IAsyncNamedNodeMap = element.attributes;

        for (let index = 0; index < namedNodeMap.length; index++) {
            const attribute: AsyncHTMLAttribute = namedNodeMap[index];

            await this.testGlobalAttributes(element, attribute, data, location);
            await this.testElementAttributes(element, attribute, data, location);
        }
    }

    private async testGlobalAttributes(element: IAsyncHTMLElement, attribute: AsyncHTMLAttribute, data: MDNTreeFilteredByBrowsers, location: ProblemLocation): Promise<void> {
        const globalAttributes = data.global_attributes;
        const attributeName = attribute.name;

        const feature: FeatureInfo = {
            displayableName: `global attribute ${attributeName}`,
            location,
            name: attributeName
        };

        await this.testFeature(globalAttributes, feature);
    }

    private async testElementAttributes(element: IAsyncHTMLElement, attribute: AsyncHTMLAttribute, data: MDNTreeFilteredByBrowsers, location: ProblemLocation): Promise<void> {
        const INPUT_TAG = 'input';
        const TYPE_ATTR = 'type';
        const elements = data.elements;
        const elementName = element.nodeName.toLowerCase();
        const subFeature: FeatureInfo = { name: attribute.name };
        let displayableName = `${attribute.name} attribute of the ${elementName} element`;

        if (elementName === INPUT_TAG && attribute.name === TYPE_ATTR) {
            displayableName = `${INPUT_TAG} ${TYPE_ATTR} ${attribute.value}`;
            subFeature.name = `${elementName}-${attribute.value}`;
        }

        const feature: FeatureInfo = {
            displayableName,
            location,
            name: elementName,
            subFeature
        };

        await this.testFeature(elements, feature);
    }

    private async testFeature(collection: CompatStatement | undefined, feature: FeatureInfo) {
        if (this.isFeatureAlreadyInUse(feature)) {
            return;
        }

        await this.testFunction(feature, collection);
    }

    private async walk(callback: (element: ElementFound) => any): Promise<void> {
        await this.hintContext.on('element::*', callback.bind(this));
    }
}
