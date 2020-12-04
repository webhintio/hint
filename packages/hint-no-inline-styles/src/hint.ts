/**
 * @fileoverview Invalidate the use of CSS inline styles in HTML
 */
import {
    HintContext,
    IHint,
    TraverseEnd
} from 'hint';
import { HTMLDocument, HTMLElement } from '@hint/utils-dom';
import { Severity } from '@hint/utils-types';
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

    public constructor(context: HintContext) {
        const validate = ({ resource }: TraverseEnd) => {
            const pageDOM: HTMLDocument = context.pageDOM as HTMLDocument;

            if (pageDOM.isFragment) {
                return;
            }

            const styleElements: HTMLElement[] = pageDOM.querySelectorAll(
                'style'
            );

            debug(`Validating rule no-inline-styles`);

            if (styleElements.length > 0) {
                context.report(
                    resource,
                    getMessage('styleElementFound', context.language),
                    { severity: Severity.error }
                );
            }

            // - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

            /*
             * Check if style attribute is used in any element
             */

            const elementsWithStyleAttribute: HTMLElement[] = pageDOM.querySelectorAll(
                '[style]'
            );

            if (elementsWithStyleAttribute.length > 0) {
                context.report(
                    resource,
                    getMessage(
                        'elementsWithStyleAttributeFound',
                        context.language
                    ),
                    { severity: Severity.error }
                );
            }
        };

        context.on('traverse::end', validate);
    }
}
