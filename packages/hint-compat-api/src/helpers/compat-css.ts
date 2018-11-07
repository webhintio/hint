import { debug as d } from 'hint/dist/src/lib/utils/debug';
import { StyleParse } from '@hint/parser-css/dist/src/types';
import { AtRule, Rule, Declaration, ChildNode } from 'postcss';
import { find } from 'lodash';
import { FeatureStrategy, MDNTreeFilteredByBrowsers, BrowserSupportCollection } from '../types';

const debug: debug.IDebugger = d(__filename);

export class CompatCSS {
    public testFunction: (key: string, name: string, data: MDNTreeFilteredByBrowsers, browsers: BrowserSupportCollection, children?: string) => void;

    public constructor(testFunction: (key: string, name: string, data: MDNTreeFilteredByBrowsers, browsers: BrowserSupportCollection, children?: string) => void) {
        this.testFunction = testFunction;
    }

    public searchCSSFeatures(data: MDNTreeFilteredByBrowsers, browsers: BrowserSupportCollection, parse: StyleParse): void {
        if (!this.testFunction) {
            debug('Error: You need to provide a testfunction');

            return;
        }

        parse.ast.walk((node: ChildNode) => {
            const strategy = this.chooseStrategyToSearchCSSFeature(node);

            strategy.testFeature(node, data, browsers);
        });
    }

    public chooseStrategyToSearchCSSFeature(childNode: ChildNode): FeatureStrategy<ChildNode> {
        const atStrategy: FeatureStrategy<AtRule> = {
            check: (node) => {
                return node.type === 'atrule';
            },

            testFeature: (node: AtRule, data, browsers) => {
                this.testFunction('at-rules', node.name, data, browsers);
            }
        };

        const ruleStrategy: FeatureStrategy<Rule> = {
            check: (node) => {
                return node.type === 'rule';
            },

            testFeature: (node: Rule, data, browsers) => {
                this.testFunction('selectors', node.selector, data, browsers);
            }
        };

        const declarationStrategy: FeatureStrategy<Declaration> = {
            check: (node) => {
                return node.type === 'decl';
            },

            testFeature: (node: Declaration, data, browsers) => {
                this.testFunction('properties', node.prop, data, browsers);
                this.testFunction('properties', node.prop, data, browsers, node.value);
            }
        };

        const defaultStrategy: FeatureStrategy<ChildNode> = {
            check: () => {
                return true;
            },

            testFeature: () => { }
        };

        const strategies = {
            atStrategy,
            declarationStrategy,
            ruleStrategy
        };

        const selectedStrategy = find(strategies, (x) => {
            return x.check(childNode);
        });

        // If no result return default strategy to be consistent
        if (!selectedStrategy) {
            debug('Error: Compat api CSS cannot find valid strategies.');

            return defaultStrategy;
        }

        return selectedStrategy as FeatureStrategy<ChildNode>;
    }
}
