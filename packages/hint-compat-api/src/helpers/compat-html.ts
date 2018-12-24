/**
 * @fileoverview Helper that contains all the logic related with HTML compat api, to use in different modules.
 */
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { ElementFound, IAsyncHTMLElement, ProblemLocation, AsyncHTMLAttribute, IAsyncNamedNodeMap, Events, Event } from 'hint/dist/src/lib/types';

import { MDNTreeFilteredByBrowsers, TestFeatureFunction, FeatureInfo } from '../types';
import { CompatStatement } from '../types-mdn.temp';
import { CompatBase } from './compat-base';

const DEFAULT_LOCATION: ProblemLocation = { column: 0, line: 0 };

export class CompatHTML extends CompatBase<Events, Event> {
    public constructor(hintContext: HintContext<Events>, MDNData: MDNTreeFilteredByBrowsers, testFunction: TestFeatureFunction) {
        super(hintContext, MDNData, testFunction);

        this.searchFeatures();
    }

    public async searchFeatures(): Promise<void> {
        await this.walk(async (elementFound: ElementFound) => {
            const { element, resource } = elementFound;
            const location = element.getLocation() || DEFAULT_LOCATION;

            this.setResource(resource);
            await this.testElement(element, location);
            await this.testAttributes(element, location);
        });
    }

    private async testElement(element: IAsyncHTMLElement, location: ProblemLocation): Promise<void> {
        const elements = this.MDNData.elements;
        const elementName = element.nodeName.toLowerCase();

        const feature: FeatureInfo = {
            displayableName: `${elementName} element`,
            location,
            name: elementName
        };

        await this.testFeature(elements, feature);
    }

    private async testAttributes(element: IAsyncHTMLElement, location: ProblemLocation): Promise<void> {
        const namedNodeMap: IAsyncNamedNodeMap = element.attributes;

        for (let index = 0; index < namedNodeMap.length; index++) {
            const attribute: AsyncHTMLAttribute = namedNodeMap[index];

            await this.testGlobalAttributes(element, attribute, location);
            await this.testElementAttributes(element, attribute, location);
        }
    }

    private async testGlobalAttributes(element: IAsyncHTMLElement, attribute: AsyncHTMLAttribute, location: ProblemLocation): Promise<void> {
        const globalAttributes = this.MDNData.global_attributes;
        const attributeName = attribute.name;

        const feature: FeatureInfo = {
            displayableName: `global attribute ${attributeName}`,
            location,
            name: attributeName
        };

        await this.testFeature(globalAttributes, feature);
    }

    private async testElementAttributes(element: IAsyncHTMLElement, attribute: AsyncHTMLAttribute, location: ProblemLocation): Promise<void> {
        const INPUT_TAG = 'input';
        const TYPE_ATTR = 'type';
        const elements = this.MDNData.elements;
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
        if (this.isFeatureAlreadyReported(feature)) {
            return;
        }

        await this.testFunction(feature, collection);
    }

    private async walk(callback: (element: ElementFound) => any): Promise<void> {
        await this.hintContext.on('element::*', callback.bind(this));
    }
}
