/**
 * @fileoverview Check if button has type attribute set
 */

import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint, ElementFound } from 'hint/dist/src/lib/types';
import { debug as d } from 'hint/dist/src/lib/utils/debug';

import meta from './meta';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class ButtonTypeHint implements IHint {

    public static readonly meta = meta;

    public constructor(context: HintContext) {

        const validateElement = async (elementFound: ElementFound) => {

            const { resource } = elementFound;

            debug(`Validating hint button-type`);

            const element = elementFound.element;
            const elementType = element.getAttribute('type');

            if (elementType === null || elementType === '') {
                await context.report(resource, 'Button type attribute has not been set', { element });
            }
        };

        context.on('element::button', validateElement);
    }
}
