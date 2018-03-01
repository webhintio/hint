/**
 * @fileoverview Makes sure that a rule is configured correctly (options, severity).
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import * as schemaValidator from 'is-my-json-valid';

import { debug as d } from '../utils/debug';
import { RuleMetadata, RuleConfig } from '../types';
import { Severity } from '../types/problems';

const debug = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

/** Returns the severity of a rule based on its configuration */
export const getSeverity = (config: RuleConfig | Array<RuleConfig>): Severity => {

    let configuredSeverity: Severity;

    if (typeof config === 'string') {
        // Ex.: "rule-name": "warning"
        configuredSeverity = Severity[config];

    } else if (typeof config === 'number') {
        // Ex.: "rule-name": 2
        configuredSeverity = config;
    } else if (Array.isArray(config)) {
        // Ex.: "rule-name": ["warning", {}]
        configuredSeverity = getSeverity(config[0]);
    }

    if (configuredSeverity >= 0 && configuredSeverity <= 2) {
        return configuredSeverity;
    }

    return null;

};

const validateRule = (schema: Array<object>, ruleConfig: object): boolean => {
    const validator = schemaValidator(schema);

    return validator(ruleConfig);
};

/** Validates that a rule has a valid configuration based on its schema */
export const validate = (meta: RuleMetadata, config, ruleId: string): boolean => {

    debug(`Validating rule ${ruleId}`);

    // We don't accept object as a valid configuration
    if (!Array.isArray(config) && typeof config === 'object') {
        return false;
    }

    const configuredSeverity: Severity = getSeverity(config);

    if (configuredSeverity === null) {
        throw new Error(`Invalid severity configured for ${ruleId}`);
    }

    // Rule schema validation
    const schema: Array<any> = meta.schema;

    /*
     * Only way to have something else to validate is if rule config
     * is similar to:  "rule-name": ["warning", {}]. Otherwise it's
     * already valid if we reach this point.
     */
    if (!Array.isArray(config) || (Array.isArray(schema) && schema.length === 0)) {
        return true;
    }

    // We could have several valid schemas for the same rule
    if (Array.isArray(schema)) {

        // No schema configuration
        if (config.length === 1) {
            return true;
        }

        // The result has to be a boolean
        return schema.some((sch) => {
            return validateRule(sch, config[1]);
        });
    }

    return validateRule(meta.schema, config[1]);
};
