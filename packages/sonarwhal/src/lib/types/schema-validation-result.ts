import * as ajv from 'ajv';

export type SchemaValidationResult = {
    data: any;
    errors: Array<ajv.ErrorObject>;
    prettifiedErrors: Array<string>;
    valid: boolean;
};
