/**
 * @fileoverview Helper that contains all the logic related with CSS compat api, to use in different modules.
 */

import { debug as d } from 'hint/dist/src/lib/utils/debug';
import { StyleParse } from '@hint/parser-css/dist/src/types';
import { ProblemLocation } from 'hint/dist/src/lib/types';
import { AtRule, Rule, Declaration, ChildNode } from 'postcss';
import { find } from 'lodash';
import { FeatureStrategy, MDNTreeFilteredByBrowsers, TestFeatureFunction, FeatureInfo } from '../types';
import { CachedCompatFeatures } from './cached-compat-features';
import { SupportBlock } from '../types-mdn.temp';
import { HintContext } from 'hint/dist/src/lib/hint-context';

const debug: debug.IDebugger = d(__filename);

export class CompatCSS {
    private testFunction: TestFeatureFunction;
    private cachedFeatures: CachedCompatFeatures;
    private hintContext: HintContext;
    private hintResource: string = 'unknown';

    public constructor(hintContext: HintContext, testFunction: TestFeatureFunction) {
        if (!testFunction) {
            throw new Error('You must set test function before test a feature.');
        }

        this.testFunction = testFunction;
        this.hintContext = hintContext;
        this.cachedFeatures = new CachedCompatFeatures();
    }

    public setResource(hintResource: string): void {
        this.hintResource = hintResource;
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

    public async searchCSSFeatures(data: MDNTreeFilteredByBrowsers, parse: StyleParse): Promise<void> {
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
        const featureData = this.validateStrategy(strategyName, featureNameWithPrefix, data, optionalChildrenNameWithPrefix);

        if (!featureData) {
            return;
        }

        featureData.location = location;

        const localFeatureNameWithPrefix: string = this.getFeatureNameWithPrefix(featureData);

        if (this.cachedFeatures.isCached(localFeatureNameWithPrefix)) {
            await this.cachedFeatures.showCachedErrors(localFeatureNameWithPrefix, this.hintContext, location);

            return;
        }

        this.cachedFeatures.add(localFeatureNameWithPrefix);

        // Check for each browser the support block
        const supportBlock: SupportBlock = featureData.info.support;

        await this.testFunction(featureData, supportBlock);
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

        return { info: featureInfo, name: featureName, prefix };
    }

    private getPrefix(name: string): [string | undefined, string] {
        const regexp = /-(moz|o|webkit|ms)-/gi;
        const matched = name.match(regexp);
        const prefix = matched && matched.length > 0 ? matched[0] : undefined;

        return prefix ? [prefix, name.replace(prefix, '')] : [prefix, name];
    }

    public async reportError(feature: FeatureInfo, message: string): Promise<void> {
        const { location } = feature;
        const featureNameWithPrefix: string = this.getFeatureNameWithPrefix(feature);

        this.cachedFeatures.addError(featureNameWithPrefix, this.hintResource, message, location);
        await this.hintContext.report(this.hintResource, message, { location });
    }

    public async reportIfThereIsNoInformationAboutCompatibility(feature: FeatureInfo): Promise<void> {
        const message = `${feature.name} of CSS was never supported on any of your browsers to support.`;

        await this.reportError(feature, message);
    }

    private getFeatureNameWithPrefix(feature: FeatureInfo): string {
        const separator: string = feature.prefix ? ' ' : '';

        return feature.prefix + separator + feature.name;
    }
}
