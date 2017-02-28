const schemaValidator = require('is-my-json-valid');

const debug = require('debug')('sonar:config-rules');

/**
 * Enum with the possible severity values of a rule
 * @readonly
 * @enum {number}
 */
const severity = {
    error: 2,
    off: 0,
    warning: 1
};

/**
 * Returns the severity of a rule based on its configuration
 * @param {severity|number|Array} config The configuration of the rule
 * @returns {sevirity}
 */
const getSeverity = (config) => {
    let configuredSeverity;

    if (typeof config === 'string') {
        // Ex.: "rule-name": "warning"
        configuredSeverity = severity[config];
    } else if (typeof config === 'number') {
        // Ex.: "rule-name": 2
        configuredSeverity = severity[config];
    } else if (Array.isArray(config)) {
        // Ex.: "rule-name": ["warning", {}]
        configuredSeverity = getSeverity(config[0]);
    }

    if (configuredSeverity >= 0 && configuredSeverity <= 2) {
        return configuredSeverity;
    }

    return null;
};


/**
 * Validates that a rule has a valid configuration based on its schema
 * @param {*} rule The rule to validate
 * @param {string|number|array} config The configuration for the given rule
 */
const validate = (rule, config, ruleId) => {
    debug('Validating rule');
    // We don't accept object as a valid configuration
    if (!Array.isArray(config) && typeof config === 'object') {
        return false;
    }

    const configuredSeverity = getSeverity(config);

    if (!configuredSeverity) {
        // TODO: find a way to get the rule Id
        throw new Error(`Invalid severity configured for ${ruleId}`);
    }

    // Rule schema validation
    const schema = rule.meta.schema;

    // Only way to have something else to validate is if rule config is similar to:  "rule-name": ["warning", {}]
    // Otherwise it is already valid if we reach this point
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

    const validateRule = schemaValidator(schema);

    return validateRule(config[1]);
};

module.exports = {
    getSeverity,
    severity,
    validate
};
