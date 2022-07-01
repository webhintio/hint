import { ProblemDocumentation } from './problem-documentation';
import { ProblemLocation } from './problem-location';
import { Category } from './category';
import { Severity } from './severity';
import { CodeFix } from './fix';

export { ProblemLocation };

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
    /**
     * The target browsers that caused this problem to be reported (if compatibility related).
     * Browser identifiers are in the `browserslist` format (e.g. `['ie 11', 'chrome 100']`).
     */
    browsers?: string[];
    /** Indicate the language of the sourceCode */
    codeLanguage?: string;
    /** The link to the documentation in the 3rd party package */
    documentation?: ProblemDocumentation[];
    /** The source edits to fix a Problem */
    fixes?: CodeFix[];
};
