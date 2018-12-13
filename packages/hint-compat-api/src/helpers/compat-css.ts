/**
 * @fileoverview Helper that contains all the logic related with CSS compat api, to use in different modules.
 */

import { debug as d } from 'hint/dist/src/lib/utils/debug';
import { StyleParse } from '@hint/parser-css/dist/src/types';
import { ProblemLocation } from 'hint/dist/src/lib/types';
import { AtRule, Rule, Declaration, ChildNode } from 'postcss';
import { find } from 'lodash';
import { FeatureStrategy, MDNTreeFilteredByBrowsers, TestFeatureFunction, FeatureInfo } from '../types';
import { SupportBlock } from '../types-mdn.temp';
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

    private async testFeature(strategyName: string, featureNameWithPrefix: string, data: MDNTreeFilteredByBrowsers, location?: ProblemLocation, optionalChildrenNameWithPrefix?: string): Promise<void> {
        const feature = this.validateStrategy(strategyName, featureNameWithPrefix, data, optionalChildrenNameWithPrefix);

        if (!feature) {
            return;
        }

        feature.location = location;

        if (this.isFeatureAlreadyInUse(feature)) {
            return;
        }

        // Check for each browser the support block
        const supportBlock: SupportBlock = feature.supportBlock;

        await this.testFunction(feature, supportBlock);
    }

    public validateStrategy(strategyName: string, featureNameWithPrefix: string, data: MDNTreeFilteredByBrowsers, optionalChildrenNameWithPrefix?: string): FeatureInfo | null {
        let [prefix, featureName] = this.getPrefix(featureNameWithPrefix);

        const strategyContent: any = data[strategyName];

        if (!strategyContent) {
            // Review: Throw an error
            debug('Error: The strategy does not exist.');

            return null;
        }

        let feature = strategyContent[featureName];

        // If feature is not in the filtered by browser data, that means that is always supported.
        if (!feature) {
            return null;
        }

        if (optionalChildrenNameWithPrefix) {
            [prefix, featureName] = this.getPrefix(optionalChildrenNameWithPrefix);
            feature = feature[featureName];

            if (!feature) {
                return null;
            }
        }

        // If feature does not have compat data, we ignore it.
        const featureInfo = feature.__compat;

        if (!featureInfo || !featureInfo.support) {
            return null;
        }

        return { name: featureName, prefix, supportBlock: featureInfo.support };
    }

    private getPrefix(name: string): [string | undefined, string] {
        const regexp = /-(moz|o|webkit|ms)-/gi;
        const matched = name.match(regexp);
        const prefix = matched && matched.length > 0 ? matched[0] : undefined;

        return prefix ? [prefix, name.replace(prefix, '')] : [prefix, name];
    }
}
