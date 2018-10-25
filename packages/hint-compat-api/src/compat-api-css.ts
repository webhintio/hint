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
import { FeatureStrategy, MDNTreeFilteredByBrowsers, BrowserSupportCollection } from './types';

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

            const checkDeprecatedCSSFeature = (name: string, data: MDNTreeFilteredByBrowsers): boolean => {

                return true;
            };

            const chooseStrategyToSearchDeprecatedCSSFeature = (childNode: ChildNode): FeatureStrategy<ChildNode> => {
                const atStrategy: FeatureStrategy<AtRule> = {
                    check: (node) => {
                        return node.type === 'atrule';
                    },

                    testFeature: (node: AtRule, data) => {
                        const isDeprecated = checkDeprecatedCSSFeature(node.name, data);

                        if (!isDeprecated) {
                            return;
                        }

                        debug('ERROR!');
                    }
                };

                const ruleStrategy: FeatureStrategy<Rule> = {
                    check: (node) => {
                        return node.type === 'rule';
                    },

                    testFeature: (node: Rule, data) => {
                        const isDeprecated = checkDeprecatedCSSFeature(node.selector, data);

                        if (!isDeprecated) {
                            return;
                        }

                        debug('ERROR!');
                    }
                };

                const declarationStrategy: FeatureStrategy<Declaration> = {
                    check: (node) => {
                        return node.type === 'decl';
                    },

                    testFeature: (node: Declaration, data) => {
                        const isDeprecated = checkDeprecatedCSSFeature(node.value, data);

                        if (!isDeprecated) {
                            return;
                        }

                        debug('ERROR!');
                    }
                };

                const defaultStrategy: FeatureStrategy<ChildNode> = {
                    check: () => {
                        return true;
                    },

                    testFeature: () => {
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

                return selectedStrategies[0] as FeatureStrategy<ChildNode>;
            };

            const searchDeprecatedCSSFeatures = (data: MDNTreeFilteredByBrowsers, browsers: BrowserSupportCollection, parse: StyleParse) => {
                parse.ast.walk((node: ChildNode) => {
                    const strategy = chooseStrategyToSearchDeprecatedCSSFeature(node);

                    strategy.testFeature(node, data, browsers);
                });
            };

            const mdnBrowsersCollection = userBrowsers.convert(context.targetedBrowsers);
            const compatApi = new CompatApi('css', mdnBrowsersCollection);

            searchDeprecatedCSSFeatures(compatApi.compatDataApi, mdnBrowsersCollection, styleParse);
        };

        context.on('parse::css::end', onParseCSS);
    }
}
