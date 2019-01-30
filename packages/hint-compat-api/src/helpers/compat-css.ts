/**
 * @fileoverview Helper that contains all the logic related with CSS compat api, to use in different modules.
 */

import { find } from 'lodash';
import { AtRule, Rule, Declaration, ChildNode } from 'postcss';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { debug as d } from 'hint/dist/src/lib/utils/debug';
import { ProblemLocation } from 'hint/dist/src/lib/types';
import { StyleParse, StyleEvents } from '@hint/parser-css/dist/src/types';

import { FeatureStrategy, TestFeatureFunction, FeatureInfo, MDNTreeFilteredByBrowsers } from '../types';
import { CompatStatement } from '../types-mdn.temp';
import { CompatBase } from './compat-base';

const debug: debug.IDebugger = d(__filename);

export const DEFAULT_CSS_IGNORE = ['cursor'];

export class CompatCSS extends CompatBase<StyleEvents, StyleParse> {
    public constructor(hintContext: HintContext<StyleEvents>, MDNData: MDNTreeFilteredByBrowsers, testFunction: TestFeatureFunction) {
        super(hintContext, MDNData, testFunction);

        hintContext.on('parse::end::css', this.onParse.bind(this));
    }

    public async searchFeatures(parse: StyleParse): Promise<void> {
        await parse.ast.walk(async (node: ChildNode) => {
            const strategy = this.chooseStrategyToSearchCSSFeature(node);
            const location = this.getProblemLocationFromNode(node);

            await strategy.testFeature(node, location);
        });
    }

    private async onParse(parse: StyleParse): Promise<void> {
        const { resource } = parse;

        this.setResource(resource);

        await this.searchFeatures(parse);
    }

    private testFeature(strategyName: string, featureNameWithPrefix: string, location?: ProblemLocation, subfeatureNameWithPrefix?: string): void {
        const collection: CompatStatement | undefined = this.MDNData[strategyName];

        if (!collection) {
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

        this.checkFeatureCompatibility(feature, collection);
    }

    private getProblemLocationFromNode(node: ChildNode): ProblemLocation | undefined {
        const start = node.source && node.source.start;

        if (!start) {
            return undefined;
        }

        return {
            column: start.column - 1,
            line: start.line - 1
        };
    }

    private chooseStrategyToSearchCSSFeature(childNode: ChildNode): FeatureStrategy<ChildNode> {
        const atStrategy: FeatureStrategy<AtRule> = {
            check: (node) => {
                return node.type === 'atrule';
            },

            testFeature: (node: AtRule, location) => {
                this.testFeature('at-rules', node.name, location);
            }
        };

        const ruleStrategy: FeatureStrategy<Rule> = {
            check: (node) => {
                return node.type === 'rule';
            },

            testFeature: (node: Rule, location) => {
                this.testFeature('selectors', node.selector, location);
            }
        };

        const declarationStrategy: FeatureStrategy<Declaration> = {
            check: (node) => {
                return node.type === 'decl';
            },

            testFeature: (node: Declaration, location) => {
                this.testFeature('properties', node.prop, location);
                this.testFeature('properties', node.prop, location, node.value);
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

    private getPrefix(name: string): [string | undefined, string] {
        const regexp = /-(moz|o|webkit|ms)-/gi;
        const matched = name.match(regexp);
        const prefix = matched && matched.length > 0 ? matched[0] : undefined;

        return prefix ? [prefix, name.replace(prefix, '')] : [prefix, name];
    }
}
