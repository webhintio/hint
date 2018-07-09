/**
 * @fileoverview Validates that a given configuration is fully valid in terms
 * of schema and options.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import { validate } from '../utils/schema-validator';
import { debug as d } from '../utils/debug';
import { UserConfig } from '../types';
import * as logger from '../utils/logging';

const debug = d(__filename);
const schema = require('./config-schema.json');

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

/** Validates that a given config object is valid */
export const validateConfig = (config: UserConfig): boolean => {

    debug('Validating configuration');
    if (!validate(schema, config).valid) {
        logger.error('Configuration schema is not valid');

        return false;
    }

    return true;
};
