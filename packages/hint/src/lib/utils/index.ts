import * as packagesUtils from './packages';
import * as resourceLoaderUtils from './resource-loader';
import * as schemaValidatorUtils from '@hint/utils/dist/src/schema-validation/schema-validator';
import * as jsonParserUtils from '@hint/utils/dist/src/json-parser';

export * from './resource-loader';

export const packages = packagesUtils;
export const resourceLoader = resourceLoaderUtils;
export const schemaValidator = schemaValidatorUtils;
export const jsonParser = jsonParserUtils;
