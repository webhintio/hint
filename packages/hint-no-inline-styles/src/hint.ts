/**
 * @fileoverview Invalidate the use of CSS inline styles in HTML
 */
import {
    HintContext,
    IHint
} from 'hint';
import { HTMLElement } from '@hint/utils-dom';
import { Severity } from '@hint/utils-types';
import { HTMLEvents, HTMLParse } from '@hint/parser-html';
import meta from './meta';
import { getMessage } from './i18n.import';
import { debug as d } from '@hint/utils-debug';

const debug: debug.IDebugger = d(__filename);
/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class NoInlineStylesHint implements IHint {
    public static readonly meta = meta;

    public constructor(context: HintContext<HTMLEvents>) {
        const validate = ({ document, resource }: HTMLParse) => {
            const styleElements: HTMLElement[] = document.querySelectorAll(
                'style'
            );

            debug(`Validating rule no-inline-styles`);

            if (styleElements.length > 0) {
                context.report(
                    resource,
                    getMessage('styleElementFound', context.language),
                    { severity: Severity.hint }
                );
            }

            // - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

            /*
             * Check if style attribute is used in any element
             */

            const elementsWithStyleAttribute: HTMLElement[] = document.querySelectorAll(
                '[style]'
            );

            if (elementsWithStyleAttribute.length > 0) {
                context.report(
                    resource,
                    getMessage(
                        'elementsWithStyleAttributeFound',
                        context.language
                    ),
                    { severity: Severity.hint }
                );
            }
        };

        context.on('parse::end::html', validate);
    }
}
