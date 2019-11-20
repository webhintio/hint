/**
 * @fileoverview Validates that a given configuration is fully valid in terms
 * of schema and options.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import { logger, UserConfig } from '@hint/utils';
import { debug as d } from '@hint/utils-debug';

import { GroupedError, SchemaValidationResult, validate } from '@hint/utils-json';

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
