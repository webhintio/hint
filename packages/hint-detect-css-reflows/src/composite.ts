/**
 * @fileoverview Let the developers know of what operations will be triggered by changes on the css properties
 */

import { Declaration, AtRule, Rule } from 'postcss';

import { HintContext } from 'hint/dist/src/lib/hint-context';
// The list of types depends on the events you want to capture.
import { IHint} from 'hint/dist/src/lib/types';
import { debug as d } from '@hint/utils-debug';
import { Severity } from '@hint/utils-types';
import { StyleEvents, StyleParse } from '@hint/parser-css';
import { getCSSLocationFromNode, getFullCSSCodeSnippet, getUnprefixed } from '@hint/utils-css';
const cssPropertiesObject = require('./assets/CSSReflow.json') || {};

import { getMessage } from './i18n.import';

import meta from './meta/composite';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class DetectCssCompositeHint implements IHint {

    public static readonly meta = meta;

    public constructor(context: HintContext<StyleEvents>) {

        const validateRule = (rule: Rule) => {
            // Code to validate the hint on the event when an element is visited.

            debug(`Validating detect-css-reflows`);
            const results = new Set<Declaration>();

            rule.each((decl) => {
                if (!('prop' in decl) || (decl.toString() ==='not valid')) {
                    return;
                }

                const name = decl.prop;
                const baseName = getUnprefixed(name);
                const propertyName = cssPropertiesObject[baseName];

                if (propertyName && propertyName.composite) {
                    results.add(decl);
                }
            });

            return results;
        };

        const validateAtRule = (rule: AtRule) => {

            let results = new Set<Declaration>();

            if (rule.name === 'keyframes') {

                // only care about css animations
                rule.each((decl) => {
                    switch (decl.type) {
                        case 'rule': {
                            results = new Set([...results, ...validateRule(decl)]);
                            break;
                        }
                        default: {
                            break;
                        }
                    }
                });
            }

            return results;
        };

        const formatMessage = (declaration: Declaration): string => {
            const propertyName = declaration.prop;
            const affectedTriggers = cssPropertiesObject[propertyName];
            const cssDeclarationTrigger = Object.getOwnPropertyNames(affectedTriggers).map((item) => {
                if (item === 'composite' && affectedTriggers[item]) {
                    return `${item.charAt(0).toLocaleUpperCase()}${item.slice(1).toLowerCase()}`;
                }

                return null;
            });

            const triggeredCSSChangesArray = cssDeclarationTrigger.filter((item) => {
                return item !== null;
            }).join(', ');

            return getMessage('issueMessage', context.language, [propertyName, triggeredCSSChangesArray]);
        };

        context.on('parse::end::css', ({ ast, element, resource }: StyleParse) => {
            debug('Validating detect-css-reflows');

            for (const node of ast.nodes) {
                switch (node.type) {
                    case 'atrule': {
                        const results = validateAtRule(node);

                        for (const declaration of results) {
                            const location = getCSSLocationFromNode(declaration, { isValue: false });
                            const severity = Severity.hint;
                            const message = formatMessage(declaration);
                            const codeSnippet = getFullCSSCodeSnippet(declaration);

                            context.report(
                                resource,
                                message,
                                {
                                    codeLanguage: 'css',
                                    codeSnippet,
                                    element,
                                    location,
                                    severity
                                });
                        }
                        break;
                    }
                    default:
                        // only care about at rules
                        break;
                }
            }
        });
        // As many events as you need
    }
}
