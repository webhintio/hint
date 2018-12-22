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
import { SchemaValidationResult } from '../types/schema-validation-result';

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
    const validateInfo: SchemaValidationResult = validate(schema, config);

    if (!validateInfo.valid) {
        logger.error('Configuration schema is not valid:');

        validateInfo.prettifiedErrors.forEach((error: string) => {
            logger.error(` - ${error}`);
        });

        return false;
    }

    return true;
};
