const schemaValidator = require('is-my-json-valid/require'),
    _ = require('lodash');

const debug = require('debug')('sonar:config-validator');

const resourceLoader = require('../util/resource-loader'),
    logger = require('../util/logging'),
    validateRule = require('./config-rules').validate;

const validateConfig = schemaValidator('config-schema.json');

module.exports = {
    validateConfig(config) {
        debug('Validating configuration');
        if (!validateConfig(config)) {
            logger.error('Configuration schema is not valid');

            return false;
        }

        // Validate also collectors, plugins, etc.
        const rules = resourceLoader.get(resourceLoader.TYPE.rule);

        const areRulesValid = _.reduce(config.rules, (acum, ruleConfig, ruleId) => {
            const rule = rules.get(ruleId);

            if (!rule) {
                logger.error(`Rule "${ruleId}" not found`);

                return false;
            }

            const validConfig = validateRule(rule, ruleConfig, ruleId);

            if (!validConfig) {
                logger.error(`Invalid configuration for "${ruleId}"`);

                return false;
            }

            return true;
        }, true);

        return areRulesValid;
    },
    validateRule
};
