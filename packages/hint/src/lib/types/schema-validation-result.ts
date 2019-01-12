import * as ajv from 'ajv';
import { ProblemLocation } from './problems';

export interface ISchemaValidationError extends ajv.ErrorObject {
    location?: ProblemLocation;
}

export type GroupedError = {
    message: string;
    errors: ISchemaValidationError[];
    location?: ProblemLocation;
};

export type SchemaValidationResult = {
    data: any;
    errors: ISchemaValidationError[];
    prettifiedErrors: string[];
    groupedErrors: GroupedError[];
    valid: boolean;
};
