/**
 * @fileoverview Hint to validate if the HTML, CSS and JS APIs of the project are deprecated or not broadly supported
 */

import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint, HintMetadata } from 'hint/dist/src/lib/types';
import { debug as d } from 'hint/dist/src/lib/utils/debug';
import { StyleParse } from '@hint/parser-css/dist/src/types';
import { AtRule, Rule, Declaration, ChildNode } from 'postcss';
import { filter } from 'lodash';
import { CompatApi, userBrowsers } from './helpers';
import { FeatureStrategy } from './types';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class implements IHint {

    public static readonly meta: HintMetadata = {
        docs: {
            category: Category.interoperability,
            description: `Hint to validate if the CSS features of the project are deprecated`
        },
        id: 'compat-api-css',
        schema: [],
        scope: HintScope.any
    }

    public constructor(context: HintContext) {
        const onParseCSS = (styleParse: StyleParse): void => {

            const chooseStrategyToSearchDeprecatedCSSFeature = (childNode: ChildNode): FeatureStrategy<ChildNode> => {
                const atStrategy: FeatureStrategy<AtRule> = {
                    check: (node) => {
                        return node.type === 'atrule';
                    },

                    testFeature: (node) => {

                    }
                };

                const ruleStrategy: FeatureStrategy<Rule> = {
                    check: (node) => {
                        return node.type === 'rule';
                    },

                    testFeature: (node) => {

                    }
                };

                const declarationStrategy: FeatureStrategy<Declaration> = {
                    check: (node) => {
                        return node.type === 'decl';
                    },

                    testFeature: (node) => {

                    }
                };

                const defaultStrategy: FeatureStrategy<Declaration> = {
                    check: () => {
                        return true;
                    },

                    testFeature: (node) => {
                        return;
                    }
                };

                const strategies = {
                    atStrategy,
                    declarationStrategy,
                    ruleStrategy
                };

                const selectedStrategies = filter(strategies, (x) => {
                    return x.check(childNode);
                });

                // If no result return default strategy to be consistent
                if (!selectedStrategies || selectedStrategies.length < 1) {
                    debug('Compat api CSS cannot find valid strategies.');

                    return defaultStrategy;
                }

                return selectedStrategies[0];
            };

            const searchDeprecatedCSSFeatures = (compatApi: CompatApi, parse: StyleParse) => {
                parse.ast.walk((node: ChildNode) => {
                    const strategy = chooseStrategyToSearchDeprecatedCSSFeature(node);

                    strategy.testFeature(node);
                });
            };

            const mdnBrowsersCollection = userBrowsers.convert(context.targetedBrowsers);
            const compatApi = new CompatApi('css', mdnBrowsersCollection);

            searchDeprecatedCSSFeatures(compatApi, styleParse);
        };

        context.on('parse::css::end', onParseCSS);
    }
}
