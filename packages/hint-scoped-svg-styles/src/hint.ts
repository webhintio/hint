/**
 * @fileoverview Scoped SVG Styles checks if SVG styles affect any other elements outside the svg.
 */

import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint } from 'hint/dist/src/lib/types';
import { debug as d } from '@hint/utils/dist/src/debug';
import { HTMLElement } from '@hint/utils/dist/src/dom/html';

import { StyleEvents, StyleParse } from '@hint/parser-css';
import { getCSSCodeSnippet } from '@hint/utils/dist/src/report/get-css-code-snippet';

import meta from './meta';
import { getMessage } from './i18n.import';
import { getCSSLocationFromNode } from '@hint/utils/dist/src/report';

const debug: debug.IDebugger = d(__filename);

const findParentSVGElement = (element: HTMLElement): HTMLElement | null => {
    if (!element.parentElement) {
        return null;
    }

    if (element.parentElement.nodeName === 'svg') {
        return element.parentElement;
    }

    return findParentSVGElement(element.parentElement);
};

const isOutsideParentSVG = (parentSVG: HTMLElement) => {
    return (element: HTMLElement): boolean => {
        const elementsParentSVG = findParentSVGElement(element);

        if (!elementsParentSVG) {
            return true;
        }
        if (!elementsParentSVG.isSame(parentSVG)) {
            return true;
        }

        return false;
    };
};

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class ScopedSvgStylesHint implements IHint {
    public static readonly meta = meta;

    public constructor(context: HintContext<StyleEvents>) {
        /** Generate a report message from elements matched outside the SVG. */
        const formatRuleMessage = (numberOfElementsOutsideSVG: number): string => {
            return getMessage('reportRuleImpacting', context.language, [
                `${numberOfElementsOutsideSVG}`
            ]);
        };

        const formatElementMessage = (codeSnippet: string): string => {
            return getMessage('reportImpactedElement', context.language, [
                codeSnippet
            ]);
        };

        const validateStyle = ({ ast, element, resource }: StyleParse) => {
            // proceed only if it is inline style
            if (!element) {
                return;
            }

            const parentSVG = findParentSVGElement(element);

            // proceed only if style is inside svg element
            if (!parentSVG) {
                return;
            }

            debug('Validating hint scoped-svg-styles');

            ast.walkRules((rule) => {
                const selectors = rule.selectors;

                for (const selector of selectors) {
                    const matchingElements = element.ownerDocument.querySelectorAll(selector);
                    const matchingElementsOutsideParentSVG = matchingElements.filter(isOutsideParentSVG(parentSVG));

                    if (matchingElementsOutsideParentSVG.length) {
                        const message = formatRuleMessage(matchingElementsOutsideParentSVG.length);
                        const location = getCSSLocationFromNode(rule);
                        const codeSnippet = getCSSCodeSnippet(rule);

                        context.report(resource, message, {
                            codeLanguage: 'css',
                            codeSnippet,
                            element,
                            location
                        });

                        let maxReportsPerCSSRule = Infinity;

                        if (context.hintOptions && context.hintOptions.maxReportsPerCSSRule !== undefined) {
                            maxReportsPerCSSRule = context.hintOptions.maxReportsPerCSSRule;
                        }

                        for (let i = 0; (i < matchingElementsOutsideParentSVG.length && i < maxReportsPerCSSRule); i++) {
                            context.report(resource, formatElementMessage(codeSnippet), { element: matchingElementsOutsideParentSVG[i] });
                        }
                    }
                }
            });
        };

        context.on('parse::end::css', validateStyle);
    }
}
