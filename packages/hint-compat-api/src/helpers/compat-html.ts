/**
 * @fileoverview Helper that contains all the logic related with HTML compat api, to use in different modules.
 */
import { HTMLElement } from '@hint/utils/dist/src/dom/html';
import { HTMLAttribute, INamedNodeMap } from '@hint/utils/dist/src/types/html';
import { getHTMLCodeSnippet } from '@hint/utils/dist/src/report/get-html-code-snippet';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { ElementFound, ProblemLocation, Events, Event } from 'hint/dist/src/lib/types';

import { MDNTreeFilteredByBrowsers, TestFeatureFunction, FeatureInfo } from '../types';
import { CompatStatement } from '../types-mdn.temp';
import { CompatBase } from './compat-base';

export const DEFAULT_HTML_IGNORE = ['integrity', 'crossorigin', 'spellcheck'];

export class CompatHTML extends CompatBase<Events, Event> {
    public constructor(hintContext: HintContext<Events>, MDNData: MDNTreeFilteredByBrowsers, testFunction: TestFeatureFunction) {
        super(hintContext, MDNData, testFunction);

        this.searchFeatures();
    }

    public searchFeatures() {
        this.walk((elementFound: ElementFound) => {
            const { element, resource } = elementFound;
            const location = element.getLocation();
            const codeSnippet = getHTMLCodeSnippet(element);

            this.setResource(resource);
            this.testElement(element, location!, codeSnippet);
            this.testAttributes(element, location!, codeSnippet);
        });
    }

    private testElement(element: HTMLElement, location: ProblemLocation, codeSnippet: string) {
        const elements = this.MDNData.elements;
        const elementName = element.nodeName.toLowerCase();

        const feature: FeatureInfo = {
            codeSnippet,
            displayableName: `${elementName} element`,
            location,
            name: elementName
        };

        this.testFeature(elements, feature);
    }

    private testAttributes(element: HTMLElement, location: ProblemLocation, codeSnippet: string) {
        const namedNodeMap: INamedNodeMap = element.attributes;

        for (let index = 0; index < namedNodeMap.length; index++) {
            const attribute: HTMLAttribute = namedNodeMap[index];

            this.testGlobalAttributes(attribute, location, codeSnippet);
            this.testElementAttributes(element, attribute, location, codeSnippet);
        }
    }

    private testElementAttributes(element: HTMLElement, attribute: HTMLAttribute, location: ProblemLocation, codeSnippet: string) {
        const INPUT_TAG = 'input';
        const TYPE_ATTR = 'type';
        const elements = this.MDNData.elements;
        const elementName = element.nodeName.toLowerCase();
        const displayableName = `${attribute.name} attribute of the ${elementName} element`;
        const subFeature: FeatureInfo = { codeSnippet, displayableName, name: attribute.name };

        if (elementName === INPUT_TAG && attribute.name === TYPE_ATTR) {
            subFeature.displayableName = `${INPUT_TAG} ${TYPE_ATTR} ${attribute.value}`;
            subFeature.name = `${elementName}-${attribute.value}`;
        }

        const feature: FeatureInfo = {
            codeSnippet,
            location,
            name: elementName,
            subFeature
        };

        this.testFeature(elements, feature);
    }

    private testGlobalAttributes(attribute: HTMLAttribute, location: ProblemLocation, codeSnippet: string) {
        const globalAttributes = this.MDNData.global_attributes;
        const attributeName = attribute.name;

        const feature: FeatureInfo = {
            codeSnippet,
            displayableName: `global attribute ${attributeName}`,
            location,
            name: attributeName
        };

        this.testFeature(globalAttributes, feature);
    }

    private testFeature(collection: CompatStatement | undefined, feature: FeatureInfo): void {
        this.checkFeatureCompatibility(feature, collection, { skipReport: false });
    }

    private walk(callback: (element: ElementFound) => any) {
        this.hintContext.on('element::*', callback.bind(this));
    }
}
