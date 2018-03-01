import { RuleConfig, RulesConfigObject } from '../types';

/**
 * @fileoverview Used for normalizing rules that are passed as configuration.
 * Rules are stored as objects internally, so this module converts rule arrays
 * to objects or if an object is passed, it returns it.
 */

const DEFAULT_RULE_LEVEL = 'error';

const shortHandRulePrefixes = {
    '-': 'off',
    '?': 'warning'
};

interface INormalizedRule extends Object {
    ruleLevel: string;
    ruleName: string;
}

const normalizeRule = (rule: string): INormalizedRule => {
    let ruleLevel: string;
    let ruleName: string;

    for (const prefix in shortHandRulePrefixes) {
        if (rule.startsWith(prefix)) {
            // Matches for rule like: `?rule1`
            ruleLevel = shortHandRulePrefixes[prefix];
            ruleName = rule.substr(1, rule.length - 1);
            break;
        }
    }

    if (!ruleLevel) {
        // Matches for a rule like: `rule1` or `rule1:warn`
        [ruleName, ruleLevel] = rule.split(':');
        ruleLevel = ruleLevel || DEFAULT_RULE_LEVEL;
    }

    return {
        ruleLevel,
        ruleName
    };
};

/**
 * Normalized all rules passed as configuration
 * Ex.:
 * * ["rule1"] => { "rule1": "error" }
 * * { "rule1": "warning" } => { "rule1": "warning" }
 * * ["rule1:warning"] => { "rule1": "warning" }
 */
export default function normalizeRules(rules: RulesConfigObject | Array<RuleConfig>): RulesConfigObject {
    if (!Array.isArray(rules)) {
        return rules;
    }

    const result = {};

    for (const rule of rules) {
        if (typeof rule === 'string') {
            const { ruleName, ruleLevel } = normalizeRule(rule);

            result[ruleName] = ruleLevel;
        } else if (Array.isArray(rule)) {
            const [ruleKey, ruleConfig] = rule;
            const { ruleName, ruleLevel } = normalizeRule(ruleKey as string);

            result[ruleName] = [ruleLevel];

            if (ruleConfig) {
                result[ruleName].push(ruleConfig);
            }
        } else {
            throw new Error(`Invalid rule type specified: "${rule}". Arrays and objects are supported.`);
        }
    }

    return result;
}
