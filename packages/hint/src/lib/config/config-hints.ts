/**
 * @fileoverview Makes sure that a hint is configured correctly (options, severity).
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import { validate as schemaValidator } from '../utils/schema-validator';
import { debug as d } from '../utils/debug';
import { HintMetadata, HintConfig } from '../types';
import { Severity } from '../types/problems';

const debug = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

/** Returns the severity of a hint based on its configuration */
export const getSeverity = (config: HintConfig | Array<HintConfig>): Severity => {

    let configuredSeverity: Severity;

    if (typeof config === 'string') {
        // Ex.: "hint-name": "warning"
        configuredSeverity = Severity[config];

    } else if (typeof config === 'number') {
        // Ex.: "hint-name": 2
        configuredSeverity = config;
    } else if (Array.isArray(config)) {
        // Ex.: "hint-name": ["warning", {}]
        configuredSeverity = getSeverity(config[0]);
    }

    if (configuredSeverity >= 0 && configuredSeverity <= 2) {
        return configuredSeverity;
    }

    return null;

};

const validateHint = (schema: object, hintConfig: object): boolean => {
    return schemaValidator(schema, hintConfig).valid;
};

/** Validates that a hint has a valid configuration based on its schema */
export const validate = (meta: HintMetadata, config, hintId: string): boolean => {

    debug(`Validating hint ${hintId}`);

    // We don't accept object as a valid configuration
    if (!Array.isArray(config) && typeof config === 'object') {
        return false;
    }

    const configuredSeverity: Severity = getSeverity(config);

    if (configuredSeverity === null) {
        throw new Error(`Invalid severity configured for ${hintId}`);
    }

    // Hint schema validation
    const schema: Array<any> = meta.schema;

    /*
     * Only way to have something else to validate is if hint config
     * is similar to:  "hint-name": ["warning", {}]. Otherwise it's
     * already valid if we reach this point.
     */
    if (!Array.isArray(config) || (Array.isArray(schema) && schema.length === 0)) {
        return true;
    }

    // We could have several valid schemas for the same hint
    if (Array.isArray(schema)) {

        // No schema configuration
        if (config.length === 1) {
            return true;
        }

        // The result has to be a boolean
        return schema.some((sch) => {
            return validateHint(sch, config[1]);
        });
    }

    return validateHint(meta.schema, config[1]);
};
