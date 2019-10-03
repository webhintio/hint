import { ProblemLocation } from './problem-location';
import { Category } from './category';

export { ProblemLocation };

/** The severity configuration of a hint */
export enum Severity {
    off = 0,
    hint = 1,
    information = 2,
    warning = 3,
    error = 4
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
