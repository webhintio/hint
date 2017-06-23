/**
 * @fileoverview Validates that a given configuration is fully valid in terms
 * of schema and options.
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import * as schemaValidator from 'is-my-json-valid/require';

import { debug as d } from '../utils/debug';
import { IConfig } from '../types'; //eslint-disable-line no-unused-vars
import * as logger from '../utils/logging';

const debug = d(__filename);

/** Validates that a configuration is valid */
const validate = schemaValidator('config-schema.json');

// ------------------------------------------------------------------------------
// Public
// ------------------------------------------------------------------------------

/** Validates that a given config object is valid */
export const validateConfig = (config: IConfig): boolean => {

    debug('Validating configuration');
    if (!validate(config)) {
        logger.error('Configuration schema is not valid');

        return false;
    }

    return true;
};
