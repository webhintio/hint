/**
 * @fileoverview Helper that contains all the logic related with CSS compat api, to use in different modules.
 */

import { debug as d } from 'hint/dist/src/lib/utils/debug';
import { StyleParse } from '@hint/parser-css/dist/src/types';
import { ProblemLocation } from 'hint/dist/src/lib/types';
import { AtRule, Rule, Declaration, ChildNode } from 'postcss';
import { find } from 'lodash';
import { FeatureStrategy, MDNTreeFilteredByBrowsers, TestFeatureFunction, FeatureInfo } from '../types';
import { SupportBlock, CompatStatement } from '../types-mdn.temp';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { CompatBase } from './compat-base';

const debug: debug.IDebugger = d(__filename);

export class CompatCSS extends CompatBase {
    public constructor(hintContext: HintContext, testFunction: TestFeatureFunction) {
        super(hintContext, testFunction);
    }

    private getProblemLocationFromNode(node: ChildNode): ProblemLocation | undefined {
        const start = node.source.start;

        if (!start) {
            return undefined;
        }

        return {
            column: start.column - 1,
            line: start.line - 1
        };
    }

    public async searchFeatures(data: MDNTreeFilteredByBrowsers, parse: StyleParse): Promise<void> {
        await parse.ast.walk(async (node: ChildNode) => {
            const strategy = this.chooseStrategyToSearchCSSFeature(node);
            const location = this.getProblemLocationFromNode(node);

            await strategy.testFeature(node, data, location);
        });
    }

    public chooseStrategyToSearchCSSFeature(childNode: ChildNode): FeatureStrategy<ChildNode> {
        const atStrategy: FeatureStrategy<AtRule> = {
            check: (node) => {
                return node.type === 'atrule';
            },

            testFeature: (node: AtRule, data, location) => {
                this.testFeature('at-rules', node.name, data, location);
            }
        };

        const ruleStrategy: FeatureStrategy<Rule> = {
            check: (node) => {
                return node.type === 'rule';
            },

            testFeature: (node: Rule, data, location) => {
                this.testFeature('selectors', node.selector, data, location);
            }
        };

        const declarationStrategy: FeatureStrategy<Declaration> = {
            check: (node) => {
                return node.type === 'decl';
            },

            testFeature: (node: Declaration, data, location) => {
                this.testFeature('properties', node.prop, data, location);
                this.testFeature('properties', node.prop, data, location, node.value);
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

    private async testFeature(strategyName: string, featureNameWithPrefix: string, data: MDNTreeFilteredByBrowsers, location?: ProblemLocation, subfeatureNameWithPrefix?: string): Promise<void> {
        const strategyContent: CompatStatement | undefined = data[strategyName];

        if (!strategyContent) {
            // Review: Throw an error
            debug('Error: The strategy does not exist.');

            return;
        }

        const [prefix, name] = this.getPrefix(featureNameWithPrefix);
        const feature: FeatureInfo = { displayableName: name, location, name, prefix };

        if (subfeatureNameWithPrefix) {
            const [prefix, name] = this.getPrefix(subfeatureNameWithPrefix);

            feature.subFeature = { name, prefix };
            feature.displayableName = name;
        }

        if (this.isFeatureAlreadyInUse(feature)) {
            return;
        }

        // Check for each browser the support block
        const supportBlock: SupportBlock = this.getSupportBlock(strategyContent, feature);

        await this.testFunction(feature, supportBlock);
    }

    private getPrefix(name: string): [string | undefined, string] {
        const regexp = /-(moz|o|webkit|ms)-/gi;
        const matched = name.match(regexp);
        const prefix = matched && matched.length > 0 ? matched[0] : undefined;

        return prefix ? [prefix, name.replace(prefix, '')] : [prefix, name];
    }
}
