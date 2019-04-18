import { ProblemLocation } from '@hint/utils';
import { Category } from '../enums/category';

export { ProblemLocation };

/** The severity configuration of a hint */
export enum Severity {
    off = 0,
    warning = 1,
    error = 2
}

/** A problem found by a hint  */
export type Problem = {
    /** The location number where the Problem is */
    location: ProblemLocation;
    /** A message providing more information about the Problem */
    message: string;
    /** The html element where the Problem is */
    sourceCode: string;
    /** The uri of the resource firing this event */
    resource: string;
    /** The name of the triggered hint */
    hintId: string;
    /** The category of the triggered hint */
    category: Category;
    /** The severity of the hint based on the actual configuration */
    severity: Severity;
    /** Indicate the language of the sourceCode */
    codeLanguage?: string;
};
