import * as ajv from 'ajv';
import { ProblemLocation } from './problems';

export interface ISchemaValidationError extends ajv.ErrorObject {
    location?: ProblemLocation;
}

export type SchemaValidationResult = {
    data: any;
    errors: Array<ISchemaValidationError>;
    prettifiedErrors: Array<string>;
    valid: boolean;
};
