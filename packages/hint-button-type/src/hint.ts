/**
 * @fileoverview Check if button has type attribute set.
 */

import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint, ElementFound, Severity } from 'hint/dist/src/lib/types';
import { debug as d } from '@hint/utils/dist/src/debug';
import { HTMLElement } from '@hint/utils';

import meta from './meta';
import { getMessage } from './i18n.import';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class ButtonTypeHint implements IHint {

    public static readonly meta = meta;

    public constructor(context: HintContext) {

        const inAForm = (element: HTMLElement): boolean => {
            const parent = element.parentElement;

            if (!parent) {
                return false;
            }

            if (parent.nodeName === 'form') {
                return true;
            }

            return inAForm(parent);
        };

        const validateElement = (elementFound: ElementFound) => {

            const { resource } = elementFound;
            const allowedTypes = ['submit', 'reset', 'button'];

            debug('Validating hint button-type');

            const element = elementFound.element;
            const elementType = element.getAttribute('type');

            if (element.isAttributeAnExpression('type')) {
                // Assume template expressions will map to a valid value.
            } else if (elementType === null || elementType === '') {
                const severity = inAForm(element) ?
                    Severity.warning :
                    Severity.hint;

                context.report(
                    resource,
                    getMessage('attributeNotSet', context.language),
                    { element, severity }
                );
            } else if (!allowedTypes.includes(elementType.toLowerCase())) {
                context.report(
                    resource,
                    getMessage('invalidType', context.language, elementType),
                    { element, severity: Severity.error });
            }
        };

        context.on('element::button', validateElement);
    }
}
