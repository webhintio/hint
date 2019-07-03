/**
 * @fileoverview check for summary tag and look for the computedStyle to check whether it is the same as it should be
 */

import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint } from 'hint/dist/src/lib/types';
import { StyleEvents, StyleParse } from '@hint/parser-css';
import meta from './meta';


export default class ValidateSummaryHint implements IHint {
    public static readonly meta = meta;
    public selectorNames: string[] = [];

    public constructor(context: HintContext<StyleEvents>) {

        const validateStyle = ({ ast, resource }: StyleParse) => {
            const elements = context.querySelectorAll('summary').map((item) => {
                return Array.from(item.attributes).map((attribute) => {
                    return attribute.value;
                });
            });

            ast.walkRules((rule) => {
                elements.forEach((attributeArray) => {
                    attributeArray.forEach((attribute) => {
                        if (rule.selector.indexOf(attribute) > -1) {
                            rule.walkDecls((decl) => {
                                if (decl.prop === 'display' && decl.value !== 'list-item') {
                                    context.report(resource, 'Summary element should have display attribute as `list-item`');
                                }
                            });
                        }
                    });
                });
                if (rule.selector === 'summary') {
                    rule.walkDecls((decl) => {
                        if (decl.prop === 'display' && decl.value !== 'list-item') {
                            context.report(resource, 'Summary element should have display attribute as `list-item`');
                        }
                    });
                }
            });
        };


        context.on('parse::end::css', validateStyle);

    }
}
