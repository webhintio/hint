/**
 * @fileoverview Validates that a given configuration is fully valid in terms of schema and options
 * @author Anton Molleda
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import * as d from 'debug';
const debug = d('sonar:config-rules');

import * as _ from 'lodash';
import * as schemaValidator from 'is-my-json-valid/require';

import * as resourceLoader from '../util/resource-loader';
import * as logger from '../util/logging';
import {validate as validateRule} from './config-rules';

/** Validates that a configuration is valid */
const validate = schemaValidator('config-schema.json');

// ------------------------------------------------------------------------------
// Public
// ------------------------------------------------------------------------------

/** Validates that a given config object is valid */
export const validateConfig = (config): boolean => {

    debug('Validating configuration');
    if (!validate(config)) {
        logger.error('Configuration schema is not valid');

        return false;
    }

    // Validate also collectors, plugins, etc.
    const rules = resourceLoader.getRules();

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

        return acum && true;
    }, true);

    return areRulesValid;
};
