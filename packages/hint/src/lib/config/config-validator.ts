/**
 * @fileoverview Validates that a given configuration is fully valid in terms
 * of schema and options.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import { debug as d, logger } from '@hint/utils';

import { validate } from '@hint/utils/dist/src/schema-validation/schema-validator';
import { UserConfig } from '../types';
import { SchemaValidationResult, GroupedError } from '@hint/utils/dist/src/schema-validation/schema-validation-result';

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

        validateInfo.groupedErrors.forEach((error: GroupedError) => {
            logger.error(` - ${error.message}`);
        });

        return false;
    }

    return true;
};
