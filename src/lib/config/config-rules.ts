/**
 * @fileoverview Makes sure that a rule is configured correctly (options, severity)
 * @author Anton Molleda
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import * as d from 'debug';

const debug = d('sonar:config-rules');

import * as schemaValidator from 'is-my-json-valid';

import { IRuleBuilder } from '../interfaces'; // eslint-disable-line no-unused-vars

// TODO: This is duplicated in types. Need to split types in different files as needed
enum Severity {
    off = 0,
    warning = 1,
    error = 2
}

// ------------------------------------------------------------------------------
// Public
// ------------------------------------------------------------------------------

/** Returns the severity of a rule based on its configuration */
export const getSeverity = (config): Severity => {

    let configuredSeverity;

    if (typeof config === 'string') {
        // Ex.: "rule-name": "warning"
        configuredSeverity = Severity[config];

    } else if (typeof config === 'number') {
        // Ex.: "rule-name": 2
        configuredSeverity = Severity[config];
    } else if (Array.isArray(config)) {
        // Ex.: "rule-name": ["warning", {}]
        configuredSeverity = getSeverity(config[0]);
    }

    if (configuredSeverity >= 0 && configuredSeverity <= 2) {
        return configuredSeverity;
    }

    return null;

};

/** Validates that a rule has a valid configuration based on its schema */
export const validate = (rule: IRuleBuilder, config, ruleId: string): boolean => {

    debug(`Validating rule ${ruleId}`);

    // We don't accept object as a valid configuration
    if (!Array.isArray(config) && typeof config === 'object') {
        return false;
    }

    const configuredSeverity = getSeverity(config);

    if (!configuredSeverity) {
        throw new Error(`Invalid severity configured for ${ruleId}`);
    }

    // Rule schema validation
    const schema = rule.meta.schema;

    // Only way to have something else to validate is if rule config
    // is similar to:  "rule-name": ["warning", {}]. Otherwise it's
    // already valid if we reach this point.
    if (!Array.isArray(config) && Array.isArray(schema) && schema.length === 0) {
        return true;
    }

    // We could have several valid schemas for the same rule
    if (Array.isArray(schema)) {
        // No schema configuration

        if (schema.length === 0 && config.length === 1) {
            return true;
        }

        return schema.find((sch) => {
            const validateRule = schemaValidator(sch);

            return validateRule(config[1]);
        });
    }

    const validateRule = schemaValidator(rule.meta.schema);

    return validateRule(config[1]);
};
