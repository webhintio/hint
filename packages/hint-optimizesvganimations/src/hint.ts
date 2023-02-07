/**
 * @fileoverview Hint that detects more performant ways of animate an SVG
 */

import { HintContext } from 'hint/dist/src/lib/hint-context';
// The list of types depends on the events you want to capture.
import { IHint, ElementFound } from 'hint/dist/src/lib/types';
import { HTMLElement, Node } from '@hint/utils-dom';

import meta from './meta';

import { getMessage } from './i18n.import';
import { Severity } from '@hint/utils-types';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class OptimizesvganimationsHint implements IHint {

    public static readonly meta = meta;

    public constructor(context: HintContext) {
        const validateElement = (elementFound: ElementFound) => {
            const { element, resource } = elementFound;

            if (element.nodeName === 'svg') {
                if (this.checkAnimateTag(element)) {
                    context.report(resource, getMessage('reportMessage', context.language), { severity: Severity.hint });
                }
            }
        };

        context.on('element::svg', validateElement);
    }

    private checkAnimateTag(element: HTMLElement): boolean {
        let result = false;

        if (!element || element.nodeType !== Node.ELEMENT_NODE) {
            return result;
        }

        const castedElement = element as HTMLElement;
        for (const element of castedElement.children) {
            if (element.nodeName === 'animate') {
                result = true;
                break;
            } else {
                result ||= this.checkAnimateTag(element);
            }
        }

        return result;
    }
}
